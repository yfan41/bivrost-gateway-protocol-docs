/**
 * Capability profiles derived from the Bivrost protocol doc §2.6 support matrices:
 * default root paths, target-dir support, subdirectory listing, dir create/delete,
 * selectProgram device list, and per-system naming rules.
 */

export interface CapabilityProfile {
  /** Default root path on the control; null = none ("无") — an explicit configured dir is required. */
  defaultRoot: string | null;
  /** Whether a target directory (dirAtCNC/subDir) may be specified at all. */
  canSpecifyDir: boolean;
  /** Whether readProgramList can return subdirectories. */
  listSubDirs: boolean;
  /** Whether createDir/deleteDir are supported. */
  createDeleteDir: boolean;
  /** Whether selectProgram is supported. */
  selectProgram: boolean;
  /** Precondition note for selectProgram, if any. */
  selectProgramNote: string | null;
  /** Okuma: the mode query parameter is mandatory. */
  selectProgramRequiresMode: boolean;
  /** Mock: selectProgram always reports success without changing state. */
  selectProgramNoop: boolean;
  /** File names must include an extension (Gsk, Siemens). */
  requiresExtension: boolean;
  /** FANUC: fileName is ignored on send; the name comes from the O-number in the content. */
  fanucContentNaming: boolean;
  /** Modern FANUC listing returns standard O-names with leading zeros stripped. */
  fanucZeroStripping: boolean;
}

const MODERN_FANUC_MODELS = ['0i-D', '0i-F', '30i', '31i', '32i', '35i', 'Power Motion i-A'];

function isModernFanuc(model: string): boolean {
  return MODERN_FANUC_MODELS.some((m) => model.toLowerCase().includes(m.toLowerCase()));
}

const BASE: CapabilityProfile = {
  defaultRoot: null,
  canSpecifyDir: true,
  listSubDirs: false,
  createDeleteDir: false,
  selectProgram: false,
  selectProgramNote: null,
  selectProgramRequiresMode: false,
  selectProgramNoop: false,
  requiresExtension: false,
  fanucContentNaming: false,
  fanucZeroStripping: false,
};

export function capabilitiesFor(
  system: string,
  model: string,
  fileServerType: string,
  fileServerRootDir: string,
): CapabilityProfile {
  const sys = system.toLowerCase();
  const fst = fileServerType.toLowerCase();
  let p: CapabilityProfile = { ...BASE };

  if (fst !== 'machine memory' && fst !== '') {
    // External file servers: broad support, root depends on server type.
    p = {
      ...BASE,
      listSubDirs: true,
      createDeleteDir: true,
      defaultRoot:
        fst === 'ftp server' ? '/' : fst.startsWith('shared folder') ? null : '/',
    };
  } else if (sys.includes('fanuc')) {
    const modern = isModernFanuc(model);
    p = {
      ...BASE,
      defaultRoot: modern ? '//CNC_MEM/' : '//CNC_MEM/',
      canSpecifyDir: modern,
      listSubDirs: modern,
      createDeleteDir: modern,
      selectProgram: modern,
      selectProgramNote: modern ? 'Control must be in Auto or Edit mode.' : null,
      fanucContentNaming: true,
      fanucZeroStripping: modern,
    };
  } else if (sys.includes('siemens')) {
    const opcua = model.toLowerCase().includes('opc');
    const legacy = model.includes('810') || model.includes('840');
    p = {
      ...BASE,
      defaultRoot: opcua ? 'Sinumerik/FileSystem/Part Program' : legacy ? 'mpf.dir' : '/nckfs',
      listSubDirs: true,
      createDeleteDir: true,
      requiresExtension: true,
    };
  } else if (sys.includes('gsk') || sys.includes('广数')) {
    p = {
      ...BASE,
      defaultRoot: '/user/NCPROG',
      requiresExtension: true,
      selectProgram: true,
      selectProgramNote: 'Supported on some versions only (Gsk 980/988).',
    };
  } else if (sys.includes('brother')) {
    const sSeries = model.toUpperCase().includes('S');
    p = {
      ...BASE,
      defaultRoot: '/',
      canSpecifyDir: sSeries,
      listSubDirs: true,
      createDeleteDir: sSeries,
      selectProgram: true,
      selectProgramNote: 'Control must be in auto-run or run-edit mode with no program running.',
    };
  } else if (sys.includes('haas')) {
    p = { ...BASE, defaultRoot: null, createDeleteDir: true };
  } else if (sys.includes('heidenhain')) {
    p = {
      ...BASE,
      defaultRoot: model.toLowerCase().includes('itnc530') ? 'TNC:\\' : 'TNC:\\nc_prog',
      listSubDirs: true,
      createDeleteDir: true,
    };
  } else if (sys.includes('okuma')) {
    p = {
      ...BASE,
      defaultRoot: 'MD1',
      listSubDirs: true,
      createDeleteDir: true,
      selectProgram: true,
      selectProgramRequiresMode: true,
      selectProgramNote:
        'Requires the mode parameter: machining centers A/B/S; lathes L/R.',
    };
  } else if (sys.includes('mitsubishi')) {
    p = {
      ...BASE,
      defaultRoot: 'PRG\\USER\\',
      createDeleteDir: false,
    };
  } else if (sys.includes('mock')) {
    p = {
      ...BASE,
      defaultRoot: '/',
      listSubDirs: true,
      createDeleteDir: true,
      selectProgram: true,
      selectProgramNoop: true,
      selectProgramNote: 'Mock machines always report success without changing the current program.',
    };
  } else if (sys.includes('delta') || sys.includes('台达')) {
    p = { ...BASE, defaultRoot: 'B:\\', createDeleteDir: true };
  } else if (sys.includes('fagor')) {
    p = { ...BASE, defaultRoot: 'MEMORY' };
  } else if (sys.includes('lynuc')) {
    p = { ...BASE, defaultRoot: '/home/Lynuc/Users/NCFiles', listSubDirs: true };
  } else if (sys.includes('rexroth')) {
    p = { ...BASE, defaultRoot: 'Filesystem/prog', listSubDirs: true, createDeleteDir: true };
  } else if (sys.includes('syntec') || sys.includes('新代')) {
    p = { ...BASE, defaultRoot: null, selectProgram: true };
  }

  if (fileServerRootDir) p = { ...p, defaultRoot: fileServerRootDir };
  return p;
}

/** The effective root for file operations: gateway-configured root, app-configured root, or the system default. */
export function effectiveRoot(p: CapabilityProfile, configuredRootDir: string | null): string | null {
  return configuredRootDir ?? p.defaultRoot;
}

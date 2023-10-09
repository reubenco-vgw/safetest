import { safeRequire } from './safe-require';
import { state } from './state';

const exists = async (path: string) => {
  const fs = safeRequire('fs');
  return new Promise((resolve) => {
    fs.access(path, (err) => resolve(!err));
  });
};

const artifacts = state.artifacts;

export const collectArtifacts = async () => {
  const path = safeRequire('path');
  const testPath = path.relative(process.cwd(), expect.getState().testPath!);

  const safePath = testPath.replace(/[^a-z0-9_]/g, '_');

  const file = state.artifactsJson;
  if (file) {
    const byTest: Record<
      string,
      Array<{ type: typeof state.artifacts[number]['type']; path: string }>
    > = {};
    const fs = safeRequire('fs');

    for (const artifact of artifacts) {
      if (await exists(artifact.path)) {
        if (!byTest[artifact.test]) byTest[artifact.test] = [];
        const info = { type: artifact.type, path: artifact.path };
        byTest[artifact.test]?.push(info);
      }
    }

    const isJest = typeof jest !== 'undefined';
    const saveTo = isJest ? `${file}_${safePath}.json` : file;
    const json = isJest ? { [testPath]: byTest } : byTest;
    fs.writeFileSync(saveTo, JSON.stringify(json, null, 2));
  }
};

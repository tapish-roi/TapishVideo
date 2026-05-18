# Remotion Studio Skill

Scaffold a new Remotion project or launch Remotion Studio for an existing one.

## Usage

```
/remotion-studio [init [--template <template>]] | [start [--port <port>]]
```

## Steps

### Detect mode from `$ARGUMENTS`

- If `$ARGUMENTS` contains `init` (or the project has no `package.json`): **scaffold** a new Remotion project.
- Otherwise: **start** Remotion Studio for the existing project.

---

### Mode: init — Scaffold a new Remotion project

1. Check that Node.js ≥ 18 is available (`node --version`). If not, tell the user to install it and stop.

2. Create the project using the official initialiser:
   ```bash
   npx create-video@latest remotion-app --template hello-world --yes
   ```
   If `--template` was supplied in `$ARGUMENTS`, use that template instead of `hello-world`.
   Available templates: `hello-world`, `blank`, `react-three-fiber`, `still`, `skia`, `tailwind`, `text-to-speech`, `text-to-video`.

3. Install dependencies:
   ```bash
   cd remotion-app && npm install
   ```

4. Start Studio:
   ```bash
   npm run dev
   ```

5. Tell the user the Studio is running at `http://localhost:3000` and how to render a video:
   ```bash
   npx remotion render src/index.ts HelloWorld out/video.mp4
   ```

---

### Mode: start — Launch Studio for an existing project

1. Verify a `package.json` exists in the current directory. If not, suggest running `/remotion-studio init` first.

2. Verify `remotion` is listed in dependencies. If not, install it:
   ```bash
   npm install remotion @remotion/cli
   ```

3. Resolve the port (default `3000`; use `--port` from `$ARGUMENTS` if provided).

4. Start Studio:
   ```bash
   npx remotion studio --port <port>
   ```

5. Confirm the URL to the user: `http://localhost:<port>`.

---

## Common Remotion CLI commands (share these with the user)

| Task | Command |
|------|---------|
| Start Studio | `npx remotion studio` |
| Render video | `npx remotion render <entry> <comp> <output>` |
| Render still image | `npx remotion still <entry> <comp> <output.png>` |
| List compositions | `npx remotion compositions <entry>` |
| Upgrade Remotion | `npx remotion upgrade` |

## Notes

- Remotion Studio hot-reloads on file changes — leave it running while editing compositions.
- Set `REMOTION_GL=angle` if you see rendering artefacts on Linux.
- For server-side rendering, use `@remotion/renderer` (Node.js API) instead of the CLI.

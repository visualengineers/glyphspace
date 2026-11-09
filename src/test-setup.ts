// Runs before every spec file (angular.json → test → setupFiles).

// Jasmine removed every spy after each spec. Vitest keeps a vi.spyOn replacement
// until it is restored, and the Angular builder runs all spec files in one
// browser context, so a spy on window, document or console would leak into later
// tests. vi.fn() mocks are not affected.
afterEach(() => {
  vi.restoreAllMocks();
});

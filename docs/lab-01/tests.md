# Lab 1 — Test Plan and Evidence  (fill this in)

All test files live under server/tests/lab-01/ and client/tests/lab-01/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Supertest | GET /api/health returns 200, status=ok | |
| 2 | Supertest | GET /api/categories returns 4 seeded categories in id order | |
| 3 | Vitest | Heading renders | |
| 4 | Vitest | Success state shows Online + category list | |
| 5 | Vitest | Error state shows Offline + message | |

Paste your passing terminal output / screenshot below.

```
PS C:\Users\User\Downloads\Lab1_Starter_Scaffold (1)\toktickit\server> npm run test

> toktickit-server@1.0.0 test
> vitest run


 RUN  v2.1.9 C:/Users/User/Downloads/Lab1_Starter_Scaffold (1)/toktickit/server

 ✓ tests/lab-01/categories.test.ts (1)
 ✓ tests/lab-01/health.test.ts (1)

 Test Files  2 passed (2)
      Tests  2 passed (2)
   Start at  04:46:01
   Duration  12.82s (transform 78ms, setup 0ms, collect 526ms, tests 150ms, environment 0ms, prepare 179ms)
```

---

```
PS C:\Users\User\Downloads\Lab1_Starter_Scaffold (1)\toktickit\client> npm run test

> toktickit-client@1.0.0 test
> vitest run


 RUN  v2.1.9 C:/Users/User/Downloads/Lab1_Starter_Scaffold (1)/toktickit/client

stderr | tests/lab-01/App.test.tsx > App > shows an Offline error message when the API is unavailable
Error checking system: Error: System is offline
    at C:\Users\User\Downloads\Lab1_Starter_Scaffold (1)\toktickit\client\tests\lab-01\App.test.tsx:43:7
    at file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/@vitest/runner/dist/index.js:146:14
    at file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/@vitest/runner/dist/index.js:533:11
    at runWithTimeout (file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/@vitest/runner/dist/index.js:39:7)
    at runTest (file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/@vitest/runner/dist/index.js:1056:17)
    at runSuite (file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/@vitest/runner/dist/index.js:1205:15)
    at runSuite (file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/@vitest/runner/dist/index.js:1205:15)
    at runFiles (file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/@vitest/runner/dist/index.js:1262:5)
    at startTests (file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/@vitest/runner/dist/index.js:1271:3)
    at file:///C:/Users/User/Downloads/Lab1_Starter_Scaffold%20(1)/toktickit/client/node_modules/vitest/dist/chunks/runBaseTests.3qpJUEJM.js:126:11

 ✓ tests/lab-01/App.test.tsx (3)
   ✓ App (3)
     ✓ renders the TokTickIT heading
     ✓ shows Online and the seeded categories on success
     ✓ shows an Offline error message when the API is unavailable

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  04:47:00
   Duration  12.83s (transform 62ms, setup 148ms, collect 162ms, tests 98ms, environment 696ms, prepare 97ms)
```
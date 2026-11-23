import net from 'net';
import { fetch, isFetchTimeoutError } from '../src/fetch.js';

// Test each condition used in isFetchTimeoutError.

test("connected but no response (type = request-timeout)", async () => {
  // Start a local server that accepts connections but never responds.
  const sockets = new Set();
  const server = net.createServer(socket => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address();
    const request = fetch(`http://127.0.0.1:${port}/`, {timeout: 100});

    await expect(request).rejects.toHaveProperty("type", "request-timeout");
    await expect(request).rejects.toSatisfy(isFetchTimeoutError);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise(resolve => server.close(resolve));
  }
});

/* NOTE: If make-fetch-happen switches HTTP agents¹, this test fails so the
 * condition can be updated.
 * ¹ i.e. if we upgrade to v12 <https://github.com/npm/make-fetch-happen/releases/tag/v12.0.0>
 */
test("connection never completes (code = ERR_SOCKET_TIMEOUT)", async () => {
  // A DNS lookup that never returns simulates incomplete connection.
  // Use a different timeout than the previous test because make-fetch-happen
  // caches agents by timeout.
  const request = fetch("http://example.invalid/", {timeout: 101, dns: {lookup: () => {}}});

  await expect(request).rejects.toHaveProperty("code", "ERR_SOCKET_TIMEOUT");
  await expect(request).rejects.toSatisfy(isFetchTimeoutError);
});

// /api/fetch-exam không được gọi vào mạng nội bộ: lọt một dải là máy chủ thành
// cửa vào metadata của cloud hay dịch vụ nội bộ.

import { test } from "node:test";
import assert from "node:assert/strict";
import { isPrivateAddress } from "../lib/privateAddress";

test("chặn mạng nội bộ, loopback, link-local, CGNAT, multicast", () => {
  for (const ip of [
    "127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1",
    "169.254.169.254", "100.64.0.1", "100.127.255.255", "0.0.0.0", "198.18.0.1",
    "224.0.0.1", "255.255.255.255",
    "::", "::1", "fc00::1", "fd12::1", "fe80::1", "febf::1", "ff02::1",
    "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:a9fe:a9fe", "::ffff:10.0.0.1",
    "not-an-ip", "",
  ]) {
    assert.equal(isPrivateAddress(ip), true, ip);
  }
});

test("cho qua địa chỉ công khai", () => {
  for (const ip of [
    "8.8.8.8", "1.1.1.1", "172.32.0.1", "100.128.0.1", "192.169.0.1", "203.162.4.191",
    "2001:4860:4860::8888", "2606:4700::1111", "::ffff:8.8.8.8",
  ]) {
    assert.equal(isPrivateAddress(ip), false, ip);
  }
});

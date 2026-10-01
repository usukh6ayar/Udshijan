import { describe, expect, it } from "vitest";
import {
  keyMatches,
  newAccessKey,
  orderCookieName,
  phoneMatches,
} from "./access";

describe("phoneMatches", () => {
  it("зөвхөн цифрийг харьцуулна", () => {
    expect(phoneMatches("9911-2233", "99112233")).toBe(true);
    expect(phoneMatches(" 9911 2233 ", "99112233")).toBe(true);
  });

  it("өөр эсвэл дутуу дугаарт худал", () => {
    expect(phoneMatches("99112234", "99112233")).toBe(false);
    expect(phoneMatches("", "")).toBe(false);
  });
});

describe("keyMatches", () => {
  it("ижил түлхүүрт үнэн, өөр/хоосонд худал", () => {
    const key = newAccessKey();
    expect(keyMatches(key, key)).toBe(true);
    expect(keyMatches(newAccessKey(), key)).toBe(false);
    expect(keyMatches(undefined, key)).toBe(false);
    expect(keyMatches("богино", key)).toBe(false);
  });

  it("түлхүүр бүр санамсаргүй, урт", () => {
    expect(newAccessKey()).not.toBe(newAccessKey());
    expect(newAccessKey().length).toBeGreaterThanOrEqual(40);
  });
});

it("cookie-ийн нэр захиалгын дугаартай", () => {
  expect(orderCookieName("UDS-261001-0421")).toBe("udshijan_order_UDS-261001-0421");
});

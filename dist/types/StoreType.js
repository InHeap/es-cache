"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StoreType;
(function (StoreType) {
    StoreType[StoreType["local"] = 0] = "local";
    StoreType[StoreType["redis"] = 1] = "redis";
})(StoreType || (StoreType = {}));
exports.default = StoreType;

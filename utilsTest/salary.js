import { ObjectId } from "mongodb";

const salaryValid = {
  userId: new ObjectId("65541e5b92fb6c12b844f5a4"),
  idAllowance: [
    new ObjectId("653716ab685eb6aaae50b285"),
    new ObjectId("65371a87685eb6aaae50b288"),
  ],
};

const salaryWithNotExistUserId = {
  userId: new ObjectId("655b77324e285ab70be2a195"),
  idAllowance: [
    new ObjectId("653716ab685eb6aaae50b285"),
    new ObjectId("65371a87685eb6aaae50b288"),
  ],
};
const salaryWithNotExistAllowanceId = {
  userId: new ObjectId("65541b49616c3f67b46e84f2"),
  idAllowance: [
    new ObjectId("65541e5b92fb6c12b844f5b4"),
    new ObjectId("65371a87685eb6aaae50b288"),
  ],
};
const salaryExisted = {
  userId: new ObjectId("651fc8ea7c42156f148974ab"),
  idAllowance: [
    new ObjectId("653716ab685eb6aaae50b285"),
    new ObjectId("65371a87685eb6aaae50b288"),
  ],
};
const salaryExistedWithNotExistAllowanceId = {
  userId: new ObjectId("651fc8ea7c42156f148974ab"),
  idAllowance: [
    new ObjectId("65541e5b92fb6c12b844f5b4"),
    new ObjectId("65371a87685eb6aaae50b288"),
  ],
};

export {
  salaryValid,
  salaryExisted,
  salaryWithNotExistAllowanceId,
  salaryWithNotExistUserId,
  salaryExistedWithNotExistAllowanceId,
};

// import { Request, Response } from "express";
// import { container } from "tsyringe";

// import { ReproveOrderUseCase } from "./ReproveOrderUseCase";

// export class ReproveOrderController {
//   async handle(request: Request, response: Response) {
//     const adminManageOrderUseCase = container.resolve(
//       ReproveOrderUseCase
//     );
//     const { id } = request.params;

//     const order = await adminManageOrderUseCase.execute({
//       order_id: id,
//       status: "",
//     });

//     response.status(201).json(order);
//   }
// }

import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";
import { RpcErrorPayload } from "./rpc.types";

//this filter runs inside the microservice process

@Catch()
export class RpcAllExceptionFilter extends BaseRpcExceptionFilter{

    catch(exception: any, host: ArgumentsHost) {
        if(exception instanceof RpcException){
            return super.catch(exception, host)
        }

        const status = exception.getStatus?.();


    if(status ===400){
        const response = exception.getResponse?.();
        const details = typeof response === 'object' && response !== null
            ? response.message
            : response;
        const payload: RpcErrorPayload = {
            code : 'VALIDATION_ERROR',
            message: 'Validation failed',
            details
        }

        return super.catch(new RpcException(payload), host)
    }

    const payload: RpcErrorPayload = {
        code : 'INTERNAL',
        message : 'Internal error'
    }

    return super.catch(new RpcException(payload), host);
    }
}
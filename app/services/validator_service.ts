import z, { ZodObject } from "zod";

type Validation<T> = { data: T } | { error: string }
export default class ValidatorService {


    validateDto<T extends ZodObject>(DTO: T, dataToCompare: unknown): Validation<z.infer<T>> {
        const validate = DTO.safeParse(dataToCompare)

        if(!validate.success) {
            const error = validate.error.issues[0].message;
            return { error }
        }

        return { data: validate.data }
    }
}
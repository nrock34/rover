import { bool, boolean, date, number, object, string } from "yup";


export const profileEducationSchema = object({
    university: string().matches(/^[1-9]\d*$/, "Select a university.").required("Select a university."),
    major: string().trim().required("Enter your major."),
    grad_year: number()
        .transform((value, originalValue) => {
            if (originalValue === null || originalValue === undefined || originalValue === "") {
                return undefined;
            }

            return value;
        })
        .integer("Select a valid graduation year.")
        .min(2010)
        .required("Select a graduation year.")
})

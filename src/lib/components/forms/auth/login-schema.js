import * as yup from "yup"

export const schema = yup.object({
    email: yup.string()
        .email("Must be an email")
        .min(4)
        .required("Email is required"),
    password: yup.string().required("Password is required")
})

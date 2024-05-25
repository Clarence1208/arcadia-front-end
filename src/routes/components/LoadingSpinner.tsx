import {CircularProgress} from "@mui/material";

type LoadingSpinnerProps = {
    message: string
}
export default function LoadingSpinner(props : LoadingSpinnerProps) {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <CircularProgress color={"inherit"} />
            <p>{props.message}</p>
        </div>
    )
}
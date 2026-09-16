import { Loader2 } from "lucide-react"

const loader = () => {
    return (
        <div className="h-full w-full absolute left-0 top-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin" />
        </div>
    )
}

export default loader;
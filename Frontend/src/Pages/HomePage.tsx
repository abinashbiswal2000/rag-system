import { Link } from "react-router"

export default function HomePage() {
    const lcn = "border border-gray-300 rounded-lg text-center hover:bg-orange-300 transition duration-400 p-2"
    return (
        <div className="text-lg p-2 flex flex-col gap-4 max-w-2xl mx-auto border border-gray-300 rounded-lg">
            <h1 className="text-2xl text-center">AI Knowledge Inbox</h1>
            <Link className={lcn} to={'/items'}>Items</Link>
            <Link className={lcn} to={'/ingest'}>Ingest</Link>
            <Link className={lcn} to={'/query'}>Query</Link>
        </div>
    )
}
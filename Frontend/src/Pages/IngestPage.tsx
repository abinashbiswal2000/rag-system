import { useState } from "react"
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router";

export default function IngestPage() {

    const navigate = useNavigate();

    const [sourceType, setSourceType] = useState("URL");
    const [obj, setObj] = useState({ heading: "", content: "" });
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setObj(
            (prev) => {
                return { ...prev, [e.target.name]: e.target.value }
            }
        );
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            const response = await fetch(
                "http://localhost:5000/ingest",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ sourceType, ...obj })
                }
            );
            if (!response.ok) {
                alert("Could not add note");
            } else {
                alert("Noted saved");
                setObj({ heading: "", content: "" });
            }
        } catch {
            alert("Could not reach the server");
        } finally {
            setLoading(false);
        }
    }

    const pcn = `mb-5 border border-gray-300 rounded-lg focus:outline-orange-300 p-2 ${sourceType === "URL" && "cursor-not-allowed bg-gray-300"}`

    return (
        <form action="" onSubmit={handleSubmit} className="flex flex-col gap-1 border border-gray-300 p-2 rounded-lg max-w-2xl mx-auto">

            <div className="w-full flex flex-row justify-between p-2">
                <div className="text-2xl py-2">Ingest Page</div>
                <button className="cursor-pointer hover:bg-gray-800 transition duration-400 p-2 bg-black text-white rounded-lg" type="button" onClick={() => { navigate('/') }}>Home Page</button>
            </div>
            <hr />

            Select Type
            <select name="sourceType" value={sourceType} onChange={(e) => { setSourceType(e.target.value); setObj({ content: "", heading: "" }) }} id="" className="mb-5 p-2 focus:outline-orange-300 border border-gray-300">
                <option value="URL">URL</option>
                <option value="TEXT">TEXT</option>
            </select>

            Enter {sourceType}
            <input name="heading" value={obj.heading} onChange={handleChange} type="text" placeholder="Heading" className="mb-5 border border-gray-300 rounded-lg focus:outline-orange-300 p-2" />

            Enter Content
            {/* <input disabled={sourceType === "URL"} type="text" placeholder="Content" className="mb-5 border border-gray-300 rounded-lg focus:outline-orange-300 p-2" /> */}
            <input name="content" value={obj.content} onChange={handleChange} disabled={sourceType === "URL"} type="text" placeholder="Content" className={pcn} />

            <button type="submit" disabled={loading} className="flex flex-row justify-around items-center cursor-pointer hover:bg-gray-800 transition duration-400 p-2 bg-black text-white rounded-lg disabled:cursor-not-allowed disabled:opacity-60">
                <div>Submit</div>
                {loading && <ClipLoader color="#36d7b7" />}
            </button>

        </form>
    )
}
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router";

type Citation = { id: number; text: string; noteTableId: number };

export default function QueryPage() {

    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState({ question: "" });
    const [answer, setAnswer] = useState("");
    const [citations, setCitations] = useState<Citation[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {

        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/query",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(question)
                }
            );

            if (!response.ok) {
                alert("Query Failed");
            } else {
                const data = await response.json();
                setAnswer(data.answer);
                setCitations(data.citations ?? []);
                setShowAnswer(true);
            }
        } catch {
            alert("Could not reach the server");
        } finally {
            setLoading(false);
        }
    }
    return (
        <form action="" onSubmit={handleSubmit} className="flex flex-col gap-1 border border-gray-300 p-2 rounded-lg max-w-2xl mx-auto">
            <div className="w-full flex flex-row justify-between p-2">
                <div className="text-2xl py-2">Query Page</div>
                <button className="cursor-pointer hover:bg-gray-800 transition duration-400 p-2 bg-black text-white rounded-lg" type="button" onClick={() => { navigate('/') }}>Home Page</button>
            </div>
            <hr />
            <input onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setShowAnswer(false); setQuestion({ question: e.target.value }) }} type="text" placeholder="Ask your Question" className="border border-gray-300 rounded-lg focus:outline-orange-300 p-2" />
            <button type="submit" disabled={loading} className="flex flex-row justify-around items-center cursor-pointer hover:bg-gray-800 transition duration-400 p-2 bg-black text-white rounded-lg disabled:cursor-not-allowed disabled:opacity-60">
                <div>Submit</div>
                {loading && <ClipLoader color="#36d7b7" />}
            </button>
            {showAnswer && (
                <div className="flex flex-col gap-2 pt-2">
                    <div>{answer}</div>
                    {citations.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <div className="font-bold">Sources</div>
                            {citations.map((c) => (
                                <div key={c.id} className="border border-gray-300 rounded-lg p-2 text-sm">
                                    <div className="font-bold text-gray-600">Note #{c.noteTableId} · chunk #{c.id}</div>
                                    <div className="max-h-40 overflow-y-auto">{c.text}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </form>
    )
}

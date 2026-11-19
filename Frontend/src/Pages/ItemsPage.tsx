import { useEffect } from "react"
import { useState } from "react"
import { useNavigate } from "react-router";
import { format, isValid } from "date-fns";

// "2026-11-19T08:02:09.916Z" -> "Nov 19th 2026, 1:32 PM" in the browser's local time zone.
// Non-dates (like the "LOADING" placeholder) are shown as they are.
function formatTimeStamp(timeStamp: string) {
    const date = new Date(timeStamp);
    return isValid(date) ? format(date, "MMM do yyyy, h:mm a") : timeStamp;
}

export default function ItemsPage() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState(
        [
            {
                "id": 1,
                "sourceType": "LOADING",
                "heading": "LOADING",
                "content": "LOADING",
                "timeStamp": "LOADING"
            }
        ]

    );
    useEffect(
        () => {
            async function f() {
                try {
                    const response = await fetch(
                        "http://localhost:5000/items",
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    )
                    if (!response.ok) {
                        alert('Could not fetch notes');
                        navigate('/');
                        return;
                    }
                    const data = await response.json();
                    setNotes(data.data);
                } catch {
                    alert('Could not reach the server');
                    navigate('/');
                }
            }
            f();
        },
        []
    );
    return (
        <div className="p-2 border border-gray-300 rounded max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-full flex flex-row justify-between p-2">
                <h1 className="p-2 text-2xl">Notes</h1>
                <button className="cursor-pointer hover:bg-gray-800 transition duration-400 p-2 bg-black text-white rounded-lg" type="button" onClick={() => { navigate('/') }}>Home Page</button>
            </div>
            {
                notes.map(
                    (value) => {
                        return (
                            <div key={value.id} className="mb-5 h-80 overflow-y-auto w-full overflow-x-auto p-2 border border-gray-300 rounded-lg">
                                <div className="font-bold bg-gray-300">{value.sourceType} <br /> {formatTimeStamp(value.timeStamp)} </div>
                                <hr />
                                <div className="font-bold">{value.heading}</div>
                                <hr />
                                <div>{value.content}</div>
                            </div>

                        )
                    }
                )
            }
        </div>
    )
}
import { Routes } from "react-router"
import { Route } from "react-router"
import QueryPage from "./Pages/QueryPage"
import ItemsPage from "./Pages/ItemsPage"
import IngestPage from "./Pages/IngestPage"
import HomePage from "./Pages/HomePage"

export default function App () {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/ingest" element={<IngestPage/>}/>
      <Route path="/items" element={<ItemsPage/>}/>
      <Route path="/query" element={<QueryPage/>}/>
    </Routes>
  )
}
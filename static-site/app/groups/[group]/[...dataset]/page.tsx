import IndividualGroupPage from "../page"

// We should only reach this page if the provided [...dataset] is nonexistent
export default function Page({ params }: { params: { dataset: string[] } }) {
    const nonExistentPath = params.dataset.join("/")
    return <IndividualGroupPage nonExistentPathParam={nonExistentPath}/>
}

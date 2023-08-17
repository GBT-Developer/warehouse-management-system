import Datatable from "../components/DataTable"
import { PageLayout } from "renderer/layout/PageLayout"

const List = () => {
  return (
    <PageLayout>
        <div className="list">
            <div className="listContainer">
                <Datatable/>
            </div>
        </div>
    </PageLayout>
  )
}

export default List
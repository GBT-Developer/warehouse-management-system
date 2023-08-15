import { AppLayout } from "renderer/layout/AppLayout"
import Datatable from "../components/DataTable"

const List = () => {
  return (
    <AppLayout>
        <div className="list">
            <div className="listContainer">
                <Datatable/>
            </div>
        </div>
    </AppLayout>
  )
}

export default List
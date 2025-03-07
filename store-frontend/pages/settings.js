import Layout from "@/components/Layout";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import { useUser } from "@/components/UserContext";
import { withSwal } from "react-sweetalert2";

function Settings() {
  const { user } = useUser();
  return (
    <Layout>
      <div>
        <h1>Settings</h1>
        
        {user?.is_admin && 
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <AddEmployeeForm />
        </div>
          }
      </div>
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Settings swal={swal} />);

import Layout from "@/components/Layout";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import axiosInstance from "@/components/AxiosInstance";
import { withSwal } from "react-sweetalert2";
import { useUser } from "@/components/UserContext";
import {
  fetchCategories,
  updateCategoryById,
  deleteCategoryById,
  insertCategory,
} from "@/utils/api";

function Categories({ swal }) {
  const { user } = useUser();
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reload, setReload] = useState(false);
  const inputRefs = useRef([]);
  useEffect(() => {
    fetchCategories().then((data) => {
      setCategories(data);
    });
  }, [reload]);

  async function saveCategory(ev) {
    ev.preventDefault();
    const propertiesObject = properties.reduce((acc, property) => {
      acc[property.name] = property.values ? property.values.split(",") : [];
      return acc;
    }, {});

    const data = {
      name,
      parent: parentCategory ? parseInt(parentCategory) : null,
      properties: propertiesObject, // use the transformed properties object
    };

    if (editedCategory) {
      data.id = editedCategory.id;
      console.log("updating category", data);
      await updateCategoryById(editedCategory.id, data);
      setEditedCategory(null);
    } else {
      console.log("inserting category", data);
      await insertCategory(data);
    }
    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
    setReload(!reload);
  }
  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?.id || "");
    console.log(category);
    setProperties(
      Object.entries(category.properties || {}).map(([key, arr]) => ({
        name: key,
        values: arr.length > 0 ? arr.join(",") : [],
      }))
    );
    setReload(!reload);
  }
  function deleteCategory(category) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { id } = category;
          await deleteCategoryById(id);
          setReload(!reload);
          fetchCategories();
        }
      });
  }
  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }
  function getCategory(categoryId) {
    const category = categories.find((category) => category.id === categoryId);
    return category ? category.name : "N/A";
  }
  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index] = { ...properties[index], name: newName };
      return properties;
    });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index] = { ...properties[index], values: newValues };
      return properties;
    });
  }
  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }
  return (
    <Layout>
      <h1>Categories</h1>
      {user?.is_admin && (
        <>
          <label>
            {editedCategory
              ? `Edit category ${editedCategory.name}`
              : "Create new category"}
          </label>
          <form onSubmit={saveCategory}>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder={"Category name"}
                onChange={(ev) => setName(ev.target.value)}
                value={name}
              />
              <select
                onChange={(ev) =>
                  setParentCategory(
                    ev.target.value === "0" ? "0" : ev.target.value
                  )
                }
                value={parentCategory}
              >
                <option value="0">No parent category</option>
                {categories.length > 0 &&
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block">Properties</label>
              <button
                onClick={addProperty}
                type="button"
                className="btn-default text-sm mb-2"
              >
                Add new property
              </button>
              {properties.length > 0 &&
                properties.map((property, index) => (
                  <div key={index} className="flex gap-1 mb-2">
                    <input
                      type="text"
                      value={property.name}
                      className="mb-0"
                      onChange={(ev) =>
                        handlePropertyNameChange(
                          index,
                          property,
                          ev.target.value
                        )
                      }
                      placeholder="property name (example: color)"
                      ref={(el) => (inputRefs.current[index] = el)}
                    />
                    <input
                      type="text"
                      className="mb-0"
                      onChange={(ev) =>
                        handlePropertyValuesChange(
                          index,
                          property,
                          ev.target.value
                        )
                      }
                      value={property.values}
                      placeholder="values, comma separated"
                    />
                    <button
                      onClick={() => removeProperty(index)}
                      type="button"
                      className="btn-red"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
            <div className="flex gap-1">
              {editedCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedCategory(null);
                    setName("");
                    setParentCategory("");
                    setProperties([]);
                  }}
                  className="btn-default"
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="btn-primary py-1">
                Save
              </button>
            </div>
          </form>
        </>
      )}
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
              {user?.is_admin && (<td></td>)}
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{getCategory(category?.parent)}</td>
                  {user?.is_admin && (<td>
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-default mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red"
                    >
                      Delete
                    </button>
                  </td>)}
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);

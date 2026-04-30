export const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "dashboard"
  },
  {
    key: "users",
    label: "Users",
    icon: "users"
  },
  {
    key: "products",
    label: "Products",
    icon: "products",
    children: [
      { key: "product-list", label: "Product List" },
      { key: "add-product", label: "Add Product" }
    ]
  },
  {
    key: "settings",
    label: "Settings",
    icon: "settings"
  }
];

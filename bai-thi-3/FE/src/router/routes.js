import store from "@/state/store";
export default [
    {
        path: "/dang-nhap",
        name: "login",
        component: () => import("../pages/login/login"),
        meta: {
            beforeResolve(routeTo, routeFrom, next) {
                if (store.getters["authStore/loggedIn"]) {
                    next({name: "default"});
                } else {
                    next();
                }
            }
        },
    },
    {
        path: "/menu",
        name: "Menu",
        meta: {},
        component: () => import("../pages/menu"),
    },
    {
        path: "/danh-muc",
        name: "default",
        meta: {},
        component: () => import("../pages/danhMuc"),
    },

    {
        path: "/nhom-quyen",
        name: "Quản lý nhóm quyền",
        meta: {can : 'viewpage-modules'},
        component: () => import("../pages/module"),
    },
    {
        path: "/nhom-quyen/action/:id?",
        name: "Hành động",
        // meta: {},
        component: () => import("../pages/module/action"),
    },
    {
        path: "/vai-tro",
        name: "Quyền",
        meta: {can: 'viewpage-roles'},
        component: () => import("../pages/role"),
    },
    {
        path: "/vai-tro/thiet-lap-quyen/:id?",
        name: "Vai trò",
        meta: {can: 'viewpage-roles' },
        component: () => import("../pages/role/addPermissions"),
    },
    {
        path: "/add-permissions",
        name: "Test ",
        component: () => import("../pages/role/addPermissions"),
    },
    {
        path: "/tai-khoan",
        name: "Tài khoản",
        component: () => import("../pages/user"),
    },
    {
        path: "/tai-khoan/doi-mat-khau",
        name: "Đổi mật khẩu",
        meta: {can: 'viewpage-user', },
        component: () => import("../pages/user/ChangePass"),
    },

    {
        path: "/thong-tin-ca-nhan",
        name: "Thông tin cá nhân",
        // meta: {},
        component: () => import("../pages/login/profile"),
    },
    {
        path: "/",
        name: "Danh sách công việc",
        // meta: {},
        component: () => import("../pages/baiThi"),
    },
    
    {
        path: "/cong-viec",
        name: "Danh sách công việc",
        // meta: {},
        component: () => import("../pages/baiThi"),
    },
    {
        path: "/cong-viec-duoc-giao",
        name: "Danh sách công việc được giao",
        // meta: {},
        component: () => import("../pages/baiThi/index_duocgiao"),
    },
    {
        path: "/chi-tiet-cong-viec",
        name: "Chi tiết công việc",
        // meta: {},
        component: () => import("../pages/baiThi/index_chitiet"),
    },


    // {
    //     path: "/trung-thuong/:id?",
    //     name: "Trúng thưởng",
    //     meta: {},
    //     component: () => import("../pages/category"),
    // },
    //
    // {
    //     path: "/hoi-dap/chi-tiet/:id?",
    //     name: "Hoạt động",
    //     meta: {},
    //     component: () => import("../pages/category/chitiet"),
    // },



  {
        path: "/404",
        name: "404",
        component: require("../pages/utility/404").default,
    },
    {
        path: "/unauthorized",
        name: "401",
        component: require("../pages/utility/401").default,
    },
    {
        path: "*",
        redirect: "404",
    },

]

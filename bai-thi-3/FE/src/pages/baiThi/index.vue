<script>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { pagingModel } from "@/models/pagingModel";
import Multiselect from "vue-multiselect";
import { baiThi3Model } from "@/models/baiThi3Model";
import Treeselect from "@riophae/vue-treeselect";
import vue2Dropzone from "vue2-dropzone";
import "vue2-dropzone/dist/vue2Dropzone.min.css";

export default {
  page: {
    title: "Danh sách công việc",
    meta: [{ name: "description", content: appConfig.description }],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
    Treeselect,
    vueDropzone: vue2Dropzone,
  },
  data() {
    return {
      title: "Danh sách công việc",
      items: [
        {
          text: "Công việc",
          href: "/cong-viec",
        },
        {
          text: "Danh sách",
          active: true,
        },
      ],
      data: [],
      fields: [
        {
          key: "STT",
          label: "STT",
          class: "td-stt",
          sortable: false,
          thClass: "hidden-sortable",
        },
        {
          key: "name",
          label: "Tên công việc",
          class: "name",
          sortable: true,
          thStyle: "text-align:center",
          thClass: "hidden-sortable",
        },
        {
          key: "trangThai",
          label: "Trạng Thái",
          thStyle: "text-align:center",
          sortable: true,
          thClass: "hidden-sortable",
        },
        {
          key: "moTaCongViec",
          label: "Mô tả",
          thStyle: "text-align:left",
          sortable: true,
          thClass: "hidden-sortable",
        },
        {
          key: "process",
          label: "Xử lý",
          class: "td-xuly",
          sortable: false,
          thClass: "hidden-sortable",
        },
      ],
      currentPage: 1,
      perPage: 10,
      pageOptions: [5, 10, 25, 50, 100],
      showModal: false,
      showModelChiTiet: false,
      showDeleteModal: false,
      submitted: false,
      sortBy: "age",
      filter: null,
      filterTrangThai: null,
      sortDesc: false,
      filterOn: [],
      numberOfElement: 1,
      totalRows: 1,
      model: baiThi3Model.baseJson(),
      listTrangThai: [],
      filesDelete: [],
      listUser: [],
      listCV: [],
      pagination: pagingModel.baseJson(),
      isShowTepTin: false,
      dropzoneOptions: {
        url: `${process.env.VUE_APP_API_URL}files/upload`,
        acceptedFiles: ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx, .zip",
        thumbnailHeight: 100,
        thumbnailWidth: 300,
        maxFiles: 30,
        maxFilesize: 50,
        maxFileSizeInMB: 50,
        headers: { "My-Awesome-Header": "header value" },
        addRemoveLinks: true,
      },
    };
  },
  created() {
    this.getListTrangThai();
    this.getListUser();
    this.getTreeView();
  },
  methods: {
    sendingEvent(files, xhr, formData) {
      formData.append("files", files);
    },
    removeThisFile(files, error, xhr) {
      let fileCongViec = JSON.parse(files.xhr.response);
      if (fileCongViec.data && fileCongViec.data.fileId) {
        let idFile = fileCongViec.data.fileId;
        let resultData = this.model.files.filter((x) => {
          return x.fileId != idFile;
        });
        this.model.files = resultData;
      }
    },
    uploadFile(files, response) {
      let fileSuccess = response.data;
      console.log("log suscess", fileSuccess);
      console.log("this.model", this.model);
      if (response.code == 0) {
        this.model.files.push({
          fileId: fileSuccess.fileId,
          fileName: fileSuccess.fileName,
          ext: fileSuccess.ext,
        });
      }
    },
    deleteFile(val) {
      var index = this.model.files.findIndex((el) => el.fileId == val);
      if (index != -1) {
        this.filesDelete.push({
          fileId: val,
        });
        this.model.files.splice(index, 1);
      }
    },

    handleDetailProject(id) {
      localStorage.setItem("currentProject", id);
      this.$router.push(`/chi-tiet-cong-viec`);
    },
    addCongViecToModel(node, instanceId) {
      if (node.id) {
        this.model.parentId = node.id;
      }
    },
    normalizer(node) {
      if (node.children == null || node.children == "null") {
        delete node.children;
      }
    },
    async fnGetList() {
      this.$refs.tblList?.refresh();
    },
    async getListTrangThai() {
      await this.$store
        .dispatch("commonStore/getAll", "DM_TRANGTHAI")
        .then((res) => {
          this.listTrangThai = res.data || [];
        });
    },
    async getListUser() {
      await this.$store.dispatch("userStore/getAllSellect").then((res) => {
        this.listUser = res.data || [];
      });
    },
    async getTreeView() {
      await this.$store.dispatch("baiThiStore/getTreeAll").then((res) => {
        this.listCV = res.data || [];
      });
    },

    async handleDelete() {
      if (this.model.id != 0 && this.model.id != null && this.model.id) {
        await this.$store
          .dispatch("baiThiStore/delete", { id: this.model.id })
          .then((res) => {
            if (res.code === 0) {
              this.fnGetList();
              this.getTreeView();
              this.showDeleteModal = false;
            }
            var a = {
              message: res.message,
              code: res.code,
            };
            this.$store.dispatch("snackBarStore/addNotify", {
              message: res.message,
              code: res.code,
            });
          });
      }
    },
    handleShowDeleteModal(id) {
      this.model.id = id;
      this.showDeleteModal = true;
    },
    async handleSubmit(e) {
      e.preventDefault();
      this.submitted = true;

      let loader = this.$loading.show({
        container: this.$refs.formContainer,
      });
      if (this.model.id != 0 && this.model.id != null && this.model.id) {
        // Update model
        await this.$store
          .dispatch("baiThiStore/update", this.model)
          .then((res) => {
            if (res.code === 0) {
              this.showModal = false;
              this.getTreeView();
              this.$refs.tblList.refresh();
            }
            this.$store.dispatch("snackBarStore/addNotify", {
              message: res.message,
              code: res.code,
            });
          });
      } else {
        // Create model
        await this.$store
          .dispatch("baiThiStore/create", this.model)
          .then((res) => {
            if (res.code === 0) {
              this.fnGetList();
              this.getTreeView();
              this.showModal = false;
              this.model = {};
            }
            this.$store.dispatch("snackBarStore/addNotify", {
              message: res.message,
              code: res.code,
            });
          });
      }
      loader.hide();
      this.submitted = false;
    },
    async handleUpdate(id) {
      await this.$store
        .dispatch("baiThiStore/getById", { id: id })
        .then((res) => {
          if (res.code === 0) {
            this.model = baiThi3Model.toJson(res.data);
            this.showModal = true;
          } else {
            this.$store.dispatch("snackBarStore/addNotify", {
              message: res.message,
              code: res.code,
            });
          }
        });
    },
    async handleView(id) {
      await this.$store
        .dispatch("baiThiStore/getById", { id: id })
        .then((res) => {
          if (res.code === 0) {
            this.model = baiThi3Model.toJson(res.data);
            this.showModal = true;
            this.showModelChiTiet = true;
          } else {
            this.$store.dispatch("snackBarStore/addNotify", {
              message: res.message,
              code: res.code,
            });
          }
        });
    },

    myProvider(ctx) {
      const params = {
        start: ctx.currentPage,
        limit: ctx.perPage,
        content: this.filter,
        sortDesc: ctx.sortDesc,
        trangThai:
          this.filterTrangThai == null ? null : this.filterTrangThai.code,
      };
      this.loading = true;
      try {
        let promise = this.$store.dispatch(
          "baiThiStore/getPagingParams",
          params
        );
        return promise.then((resp) => {
          let items = resp.data.data;
          this.totalRows = resp.data.totalRows;
          this.numberOfElement = resp.data.data.length;
          this.loading = false;
          return items || [];
        });
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {},
  watch: {
    model: {
      deep: true,
      handler(val) {
        // addCoQuanToModel()
        // this.saveValueToLocalStorage()
      },
    },
    showModal(status) {
      if (status == false) this.model = baiThi3Model.baseJson();
    },
    // model() {
    //   return this.model;
    // },
    showDeleteModal(val) {
      if (val == false) {
        this.model.id = null;
      }
    },
    filterTrangThai: {
      handler(val) {
        this.fnGetList();
      },
      deep: true,
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-6 search-box align-items-center">
                <div class="position-relative me-2">
                  <input
                    v-model="filter"
                    type="text"
                    class="form-control"
                    placeholder="Tìm kiếm ..."
                  />
                  <i class="bx bx-search-alt search-icon"></i>
                </div>
                &nbsp;
              </div>
              <div class="col-6 align-items-center">
                <label class="me-2 mb-0" style="width: 20%">Trạng thái:</label>
                <multiselect
                  v-model="filterTrangThai"
                  :options="listTrangThai"
                  :multiple="false"
                  track-by="code"
                  selectLabel="Nhấn vào để chọn"
                  deselectLabel="Nhấn vào để xóa"
                  label="name"
                  placeholder="Tìm kiếm theo trạng thái"
                  class="flex-grow-1"
                >
                </multiselect>
              </div>

              <div class="col-sm-12">
                <div class="text-sm-end">
                  <b-button
                    type="button"
                    class="btn-label mb-2 me-2 btn-rounded btn-large"
                    @click="showModal = true"
                  >
                    <i class="mdi mdi-plus me-1 label-icon"></i> Tạo công việc
                  </b-button>
                  <b-modal
                    v-model="showModal"
                    title="Thông tin công việc"
                    title-class="text-black font-18"
                    body-class="p-3"
                    hide-footer
                    centered
                    no-close-on-backdrop
                    size="lg"
                  >
                    <form @submit.prevent="handleSubmit" ref="formContainer">
                      <div class="row">
                        <div class="col-6">
                          <div class="mb-3">
                            <label class="text-left">Tên công việc</label>
                            <span style="color: red">&nbsp;*</span>
                            <input type="hidden" v-model="model.id" />
                            <input
                              id="userName"
                              v-model.trim="model.name"
                              type="text"
                              class="form-control"
                              placeholder="Nhập tên công việc"
                            />
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="mb-3">
                            <label class="text-left">Trạng thái</label>
                            <multiselect
                              v-model="model.trangThai"
                              :options="listTrangThai"
                              label="name"
                              :multiple="false"
                              selectLabel="Nhấn vào để chọn"
                              deselectLabel="Nhấn vào để xóa"
                              placeholder="Chọn trạng thái công việc"
                            >
                            </multiselect>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="mb-3">
                            <label class="text-left">Ngày bắt đầu</label>
                            <span style="color: red">&nbsp;*</span>
                            <input type="hidden" v-model="model.id" />
                            <input
                              id="thoiGianBatDau"
                              v-model="model.thoiGianBatDau"
                              type="date"
                              class="form-control"
                            />
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="mb-3">
                            <label class="text-left">Ngày kết thúc</label>
                            <span style="color: red">&nbsp;*</span>
                            <input type="hidden" v-model="model.id" />
                            <input
                              id="thoiGianKetThuc"
                              v-model="model.thoiGianKetThuc"
                              type="date"
                              class="form-control"
                            />
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="mb-3">
                            <label class="text-left">Mô tả</label>
                            <input type="hidden" v-model="model.id" />
                            <textarea
                              id="moTaCongViec"
                              v-model="model.moTaCongViec"
                              type="text"
                              class="form-control"
                              placeholder="Nhập mô tả công việc"
                              rows="5"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="mb-3">
                          <label class="text-left">Người giải quyết</label>
                          <multiselect
                            v-model="model.nguoiThucHien"
                            :options="listUser"
                            label="name"
                            :multiple="true"
                            selectLabel="Nhấn vào để chọn"
                            deselectLabel="Nhấn vào để xóa"
                            track-by="id"
                            placeholder="Chọn người giải quyết công việc"
                          >
                          </multiselect>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="text-left">Công việc cha</label>
                        <treeselect
                          v-on:select="addCongViecToModel"
                          :normalizer="normalizer"
                          :options="listCV"
                          :value="model.parentId"
                          :searchable="true"
                          :show-count="true"
                          :default-expand-level="1"
                        >
                          <label
                            slot="option-label"
                            slot-scope="{
                              node,
                              shouldShowCount,
                              count,
                              labelClassName,
                              countClassName,
                            }"
                            :class="labelClassName"
                          >
                            {{ node.label }}
                            <span v-if="shouldShowCount" :class="countClassName"
                              >({{ count }})</span
                            >
                          </label>
                        </treeselect>
                      </div>
                      <div class="mb-3">
                        <b-form-group label="File đính kèm" label-for="files">
                          <div v-if="model.files.length > 0">
                            <div
                              v-for="file in model.files"
                              :key="file.fileId"
                              class="file-item"
                            >
                              <b-link
                                class="ml-25"
                                :href="`https://localhost:5001/api/v1/files/view/${file.fileId}`"
                                target="_blank"
                              >
                                {{ file.fileName }}
                              </b-link>

                              <button
                                type="button"
                                size="sm"
                                class="btn btn-outline btn-sm"
                                v-on:click="deleteFile(file.fileId)"
                              >
                                <i
                                  class="fas fa-trash-alt text-danger me-1"
                                ></i>
                              </button>
                            </div>
                          </div>
                          <vue-dropzone
                            id="dropzone"
                            ref="myVueDropzone"
                            :use-custom-slot="true"
                            :options="dropzoneOptions"
                            v-on:vdropzone-sending="sendingEvent"
                            v-on:vdropzone-removed-file="removeThisFile"
                            v-on:vdropzone-success="uploadFile"
                          >
                            <div class="dropzone-custom-content">
                              <div class="mb-1">
                                <i
                                  class="display-4 text-muted bx bxs-cloud-upload"
                                ></i>
                              </div>
                              <h4>
                                Kéo thả tệp hoặc click vào đây để tải tệp tin.
                              </h4>
                            </div>
                          </vue-dropzone>
                        </b-form-group>
                      </div>
                      <div class="text-end pt-2 mt-3">
                        <b-button
                          variant="light"
                          @click="showModal = false"
                          class="border-0"
                        >
                          Đóng
                        </b-button>
                        <b-button
                          type="submit"
                          variant="success"
                          class="ms-1 cs-btn-primary"
                          >Lưu
                        </b-button>
                      </div>
                    </form>
                  </b-modal>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="row mt-1">
                  <div class="col-sm-12 col-md-6">
                    <div
                      class="col-sm-12 d-flex justify-content-left align-items-center"
                    >
                      <div
                        id="tickets-table_length"
                        class="dataTables_length m-1"
                        style="
                          display: flex;
                          justify-content: left;
                          align-items: center;
                        "
                      >
                        <div class="me-1">Hiển thị</div>
                        <b-form-select
                          class="form-select form-select-sm"
                          v-model="perPage"
                          size="sm"
                          :options="pageOptions"
                          style="width: 70px"
                        ></b-form-select
                        >&nbsp;
                        <div style="width: 100px">dòng</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="table-responsive mb-0">
                  <b-table
                    class="datatables table-admin"
                    :items="myProvider"
                    :fields="fields"
                    striped
                    bordered
                    responsive="sm"
                    :per-page="perPage"
                    :current-page="currentPage"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :filter="filter"
                    :filter-included-fields="filterOn"
                    ref="tblList"
                    primary-key="id"
                  >
                    <template v-slot:cell(STT)="data">
                      {{ data.index + (currentPage - 1) * perPage + 1 }}
                    </template>
                    <template v-slot:cell(name)="data">
                      <span style="margin-left: 5px">
                        <a
                          style="cursor: pointer"
                          v-on:click="handleDetailProject(data.item.id)"
                        >
                          {{ data.item.name }}
                        </a>
                      </span>
                    </template>
                    <template v-slot:cell(trangThai)="data">
                      <span style="margin-left: 5px">
                        {{ data.item.trangThai?.name }}
                      </span>
                    </template>
                    <template v-slot:cell(process)="data">
                      <button
                        type="button"
                        size="sm"
                        class="btn btn-outline btn-sm"
                        v-on:click="handleView(data.item.id)"
                      >
                        <i class="fas fa-eye text-success me-1"></i>
                      </button>
                      <button
                        type="button"
                        size="sm"
                        class="btn btn-outline btn-sm"
                        v-on:click="handleUpdate(data.item.id)"
                      >
                        <i class="fas fa-pencil-alt text-success me-1"></i>
                      </button>
                      <button
                        type="button"
                        size="sm"
                        class="btn btn-outline btn-sm"
                        v-on:click="handleShowDeleteModal(data.item.id)"
                      >
                        <i class="fas fa-trash-alt text-danger me-1"></i>
                      </button>
                    </template>
                  </b-table>
                </div>
                <div class="row">
                  <b-col>
                    <div>
                      Hiển thị {{ numberOfElement }} trên tổng số
                      {{ totalRows }} dòng
                    </div>
                  </b-col>
                  <div class="col">
                    <div
                      class="dataTables_paginate paging_simple_numbers float-end"
                    >
                      <ul class="pagination pagination-rounded mb-0">
                        <!-- pagination -->
                        <b-pagination
                          v-model="currentPage"
                          :total-rows="totalRows"
                          :per-page="perPage"
                        ></b-pagination>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <b-modal
              v-model="showDeleteModal"
              centered
              title="Xóa dữ liệu"
              title-class="font-18"
              no-close-on-backdrop
            >
              <p>Dữ liệu xóa sẽ không được phục hồi!</p>
              <template #modal-footer>
                <button
                  v-b-modal.modal-close_visit
                  class="btn btn-outline-info m-1"
                  v-on:click="showDeleteModal = false"
                >
                  Đóng
                </button>
                <button
                  v-b-modal.modal-close_visit
                  class="btn btn-danger btn m-1"
                  v-on:click="handleDelete"
                >
                  Xóa
                </button>
              </template>
            </b-modal>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
<style>
.td-xuly {
  text-align: center;
  width: 20%;
}
.btn-rounded {
  margin-top: 10px;
  background-color: blueviolet;
}
</style>

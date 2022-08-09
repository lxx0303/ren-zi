<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs @tab-click="handleClick">
          <el-tab-pane label="角色管理" name="first">
            <!-- 新增角色按钮 -->
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="showDialog = true"
            >新增角色</el-button>
            <!-- 表格 -->
            <el-table :data="list" border style="margin-top: 20px">
              <el-table-column type="index" label="序号" width="180" />
              <el-table-column prop="name" label="角色名称" width="180" />
              <el-table-column prop="description" label="描述" />
              <el-table-column label="操作">
                <template v-slot="{ row }">
                  <el-button
                    size="small"
                    type="success"
                    @click="settingClick(row.id)"
                  >分配权限</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click="edit(row.id)"
                  >编辑</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="del(row.id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-row
              type="flex"
              justify="center"
              align="middle"
              style="margin-top: 20px"
            >
              <el-pagination
                :page-size="page.pagesize"
                :current-page="page.page"
                background
                layout="prev, pager, next"
                :total="page.total"
                @current-change="changePage"
              />
            </el-row>
          </el-tab-pane>
          <!-- 公司设置 -->
          <el-tab-pane label="公司设置" name="second">
            <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
              show-icon
              :closable="false"
            />
            <el-form label-width="120px" style="margin-top: 50px">
              <el-form-item label="公司名称">
                <el-input
                  v-model="formData.name"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input
                  v-model="formData.companyAddress"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input
                  v-model="formData.mailbox"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remarks"
                  type="textarea"
                  :rows="3"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <el-dialog title="编辑信息" :visible="showDialog" @close="close">
      <el-form
        ref="roleFrom"
        :model="roleFormData"
        :rules="ruleRules"
        label-width="120px"
      >
        <el-form-item label="角色" prop="name">
          <el-input v-model="roleFormData.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="roleFormData.description" />
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <template #footer>
        <el-button size="small" @click="close">取消</el-button>
        <el-button size="small" type="primary" @click="btnOk">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog
      title="分配权限"
      :visible="showPermDialog"
      @close="closePermDialog"
    >
      <!-- 权限是一颗树 -->
      <!-- 将数据绑定到组件上 -->
      <!-- check-strictly 如果为true 那表示父子勾选时  不互相关联 如果为false就互相关联 -->
      <!-- id作为唯一标识 -->
      <el-tree
        ref="permTree"
        :data="PermissionList"
        :props="props"
        show-checkbox
        check-strictly
        default-expand-all
        :default-checked-keys="checkedKeys"
        node-key="id"
      />
      <template #footer>
        <el-button
          size="small"
          type="primary"
          @click="btnPermission"
        >确定</el-button>
        <el-button size="small" @click="closePermDialog">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  deleteRole,
  getCompanyInfo,
  getRoleList,
  getRoleDetail,
  updateRole,
  addRole,
  assignPerm
} from '@/api/setting'
import { getPermissionList } from '@/api/permission'
import { transListToTree } from '@/utils'
export default {
  data() {
    return {
      props: {
        label: 'name'
      },
      checkedKeys: [],
      PermissionList: [],
      showPermDialog: false,
      showDialog: false,
      currentRoleId: null,

      roleFormData: {
        name: '',
        description: ''
      },
      ruleRules: {
        name: [
          {
            required: true,
            message: '角色必填'
          }
        ]
      },
      list: [],
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 2,
        total: 0 // 记录总数
      },
      formData: []
    }
  },
  created() {
    this.getRoleList()
    this.getCompanyInfo()
  },
  methods: {
    async btnPermission() {
      const checkedKeys = this.$refs.permTree.getCheckedKeys()
      console.log(checkedKeys)
      await assignPerm({
        id: this.currentRoleId,
        permIds: checkedKeys
      })
      this.$message.success('分配权限成功')
      this.closePermDialog()
    },
    closePermDialog() {
      this.showPermDialog = false
      this.checkedKeys = []
    },
    async settingClick(id) {
      this.currentRoleId = id
      const res = transListToTree(await getPermissionList(), '0')
      console.log(res)
      this.PermissionList = res
      const { permIds } = await getRoleDetail(id)
      this.checkedKeys = permIds
      this.showPermDialog = true
    },

    handleClick(tab, event) {
      console.log(tab, event)
    },
    async getRoleList() {
      const { rows, total } = await getRoleList(this.page)
      this.list = rows
      this.page.total = total
    },
    changePage(page) {
      // 切换之后的最新页码
      this.page.page = page // 将当前页码赋值给当前的最新页码
      this.getRoleList()
    },
    // 获取公司详细信息（公司设置）
    async getCompanyInfo() {
      // 使用公司id
      this.formData = await getCompanyInfo(this.$store.getters.companyId)
    },
    // 删除
    async del(id) {
      await this.$confirm('确认删除？')
      const len = this.list.length
      await deleteRole(id)
      if (len === 1 && this.page.page > 1) {
        this.page.page--
      }
      this.$message.success('删除成功')
      this.getRoleList()
    },
    async edit(id) {
      this.showDialog = true
      this.roleFormData = await getRoleDetail(id)
    },
    close() {
      this.showDialog = false
      this.$refs.roleFrom.resetFields()
      this.roleFormData = {
        name: '',
        description: ''
      }
    },
    // 点击确定提交编辑数据
    async btnOk() {
      await this.$refs.roleFrom.validate()
      if (this.roleFormData.id) {
        await updateRole(this.roleFormData)
      } else {
        await addRole(this.roleFormData)
      }
      this.$message.success('成功')
      // 重新获取列表数据
      await this.getRoleList()
      this.close()
    }
  }
}
</script>

<style></style>

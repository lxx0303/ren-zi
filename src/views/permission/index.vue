<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 靠右的按钮 -->
      <ToolBar>
        <template v-slot:after>
          <el-button
            type="primary"
            size="small"
            @click="addPermission('0', 1)"
          >添加权限</el-button>
        </template>
      </ToolBar>
      <!-- 表格 -->
      <el-table border :data="list" row-key="id">
        <el-table-column align="center" label="名称" prop="name" />
        <el-table-column align="center" label="标识" prop="code" />
        <el-table-column align="center" label="描述" prop="description" />
        <el-table-column align="center" label="操作">
          <template v-slot="{ row }">
            <el-button
              v-if="row.type === 1"
              type="text"
              @click="addPermission(row.id, 2)"
            >添加</el-button>
            <el-button
              type="text"
              @click="editPermisssion(row.id)"
            >编辑</el-button>
            <el-button
              type="text"
              @click="delPermission(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 放置一个弹层 用来编辑新增节点 -->
    <el-dialog :title="`${title}权限`" :visible="showDialog" @close="close">
      <!-- 表单 -->
      <el-form
        ref="perForm"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" style="width: 90%" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="formData.code" style="width: 90%" />
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input v-model="formData.description" style="width: 90%" />
        </el-form-item>
        <el-form-item label="开启">
          <!-- /*
          当值为1(active-value)时，激活节点，当值为(inactive-value)0时，不激活
          */ /* v-model绑定的为当前switch对应的值 */ -->
          <el-switch
            v-model="formData.enVisible"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" type="primary" @click="btnOk">确定</el-button>
        <el-button size="small" @click="close">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPermissionList,
  addPermission,
  delPermission,
  getPermissionDeatil,
  updatePermission
} from '@/api/permission'
import { transListToTree } from '@/utils'

export default {
  name: 'Permission',
  data() {
    return {
      list: [],
      showDialog: false,
      // formData数据和rules数据
      formData: {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 开启
      },
      // 新增或者编辑弹框的校验规则，
      rules: {
        name: [
          { required: true, message: '权限名称不能为空', trigger: 'blur' }
        ],
        code: [{ required: true, message: '权限标识不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    title() {
      return this.formData.id ? '编辑' : '新增'
    }
  },
  created() {
    this.getPermissionList()
  },
  methods: {
    async editPermisssion(id) {
      const res = await getPermissionDeatil(id)
      // 覆盖formdata，弹层表单就可以回显数据
      this.formData = res
      // 更具当前点击的权限id，获取权限详情数据  >>>>数据回显
      this.showDialog = true
    },
    async delPermission(id) {
      await this.$confirm('确认删除')
      await delPermission(id)
      this.$message.success('删除成功')
      await this.getPermissionList()
    },
    async btnOk() {
      await this.$refs.perForm.validate()
      try {
        if (this.formData.id) {
          // 编辑
          await updatePermission(this.formData)
        } else {
          await addPermission(this.formData)
        }
        this.$message.success(`${this.title}权限成功`)
        this.close()
        await this.getPermissionList()
      } catch (error) {
        this.$message.error('修改失败')
      }
    },
    close() {
      this.$refs.perForm.resetFields()
      this.formData = {
        name: '', // 名称
        code: '', // 标识
        description: '', // 描述
        type: '', // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: '', // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: '0' // 开启
      }
      this.showDialog = false
    },
    addPermission(pid, type) {
      // pid, type是点击的时候传递过来的
      // 记录到formData里面  》》》提交的接口需要这些字段
      this.formData.pid = pid
      this.formData.type = type
      this.showDialog = true
    },
    async getPermissionList() {
      const res = await getPermissionList()
      console.log(res)

      this.list = transListToTree(res, '0')
    }
  }
}
</script>

<style></style>

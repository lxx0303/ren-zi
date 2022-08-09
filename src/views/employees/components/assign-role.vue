<template>
  <el-dialog title="分配角色" :visible="showDialog" @close="close">
    <!-- el-checkbox-group选中的是 当前用户所拥有的角色  需要绑定 当前用户拥有的角色-->
    <el-checkbox-group v-model="roleIds">
      <!-- 选项 -->
      <el-checkbox v-for="item in list" :key="item.id" :label="item.id">
        {{ item.name }}
      </el-checkbox>
    </el-checkbox-group>

    <template #footer>
      <el-button type="primary" size="mini" @click="btnOK">确定</el-button>
      <el-button size="mini" @click="close">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { getRoleList } from '@/api/setting'
import { getUserDetailById } from '@/api/user'
import { assignRoles } from '@/api/employees'

export default {
  name: 'AssignRole',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    // 用户的id 用来查询当前用户的角色信息
    currentId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      roleIds: [],
      list: []
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    close() {
      this.roleIds = []
      this.$emit('update:showDialog', false)
    },
    async btnOK() {
      try {
        await assignRoles({
          id: this.currentId,
          roleIds: this.roleIds
        })
        this.$message.success('修改角色成功')
        this.close()
      } catch (e) {
        this.$message.error('修改失败')
        this.close()
      }
    },
    //  获取所有角色
    async getRoleList() {
      const { rows } = await getRoleList()
      this.list = rows
    },
    // 获取当前点击用户的角色数据，gei roleId进行赋值
    async getCurrentRoleId(id) {
      const { roleIds } = await getUserDetailById(id)
      this.roleIds = roleIds
    }
  }
}
</script>

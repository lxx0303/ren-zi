<template>
  <el-row style="width: 100%" type="flex" justify="space-between">
    <el-col>
      <span>{{ treeData.name }}</span>
    </el-col>
    <el-col :span="10">
      <el-row type="flex" justify="space-between">
        <el-col>
          <span>{{ treeData.manager }}</span>
        </el-col>
        <el-col :span="21">
          <el-dropdown style="margin-left: 10px" @command="clickItem">
            <span class="el-dropdown-link">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="add">添加部门</el-dropdown-item>
              <el-dropdown-item
                v-if="!isRoot"
                command="edit"
              >编辑部门</el-dropdown-item>
              <el-dropdown-item
                v-if="!isRoot"
                command="delete"
              >删除部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { delDepartments } from '@/api/departments'

export default {
  name: 'TreeTool',
  props: {
    treeData: {
      type: Object,
      default: () => ({})
    },
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    async clickItem(type) {
      console.log(type)
      if (type === 'add') {
        // 添加逻辑
        console.log('添加')
        this.$emit('handelAddDepts', this.treeData)
      } else if (type === 'edit') {
        console.log('编辑')
        this.$emit('handelEditDepts', this.treeData)
      } else {
        await this.$confirm('确认删除？')
        console.log('点击了确定')
        await delDepartments(this.treeData.id)
        // 删除成功
        this.$message.success('删除成功')
        this.$emit('delDepartments')
      }
    }
  }
}
</script>

<style></style>

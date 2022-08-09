<template>
  <div v-loading="loading" class="dashboard-container">
    <div class="app-container">
      <el-card class="tree-card">
        <TreeTool
          :is-root="true"
          :tree-data="company"
          @handelAddDepts="handelAddDepts"
        />
      </el-card>
      <el-tree default-expand-all :data="departs" :props="defaultProps">
        <template v-slot="{ data }">
          <TreeTool
            :is-root="false"
            :tree-data="data"
            @handelAddDepts="handelAddDepts"
            @getDepartments="getDepartments"
            @handelEditDepts="handelEditDepts"
          />
        </template>
      </el-tree>
    </div>
    <!-- 弹层结构 -->
    <AddDept
      ref="addDept"
      :is-show-add-depts.sync="isShowAddDepts"
      :current-node="currentNode"
    />
  </div>
</template>

<script>
import TreeTool from '@/views/departments/components/tree-tool.vue'
import AddDept from '@/views/departments/components/add-dept.vue'
import { getDepartments } from '@/api/departments'
import { transListToTree } from '@/utils'

export default {
  components: { TreeTool, AddDept },
  data() {
    return {
      loading: false,
      isShowAddDepts: false, // 控制弹窗
      currentNode: {},

      defaultProps: {
        children: 'children',
        label: 'name'
      },
      departs: [
        {
          name: '总裁办',
          manager: '李易峰',
          children: [{ name: '董事会', manager: '赖咸旭' }]
        },
        { name: '行政部', manager: '薛之谦' },
        { name: '人事部', manager: '赵丽颖' }
      ],
      company: { name: '江苏传智播客教育科技股份有限公司', message: '负责人' }
    }
  },
  created() {
    this.getDepartments()
  },
  methods: {
    handelAddDepts(node) {
      this.isShowAddDepts = true // 显示弹层
      this.currentNode = node
    },
    // ？点击编辑按钮触发方法
    // 当前方法传递给tree-tool组件，组件内部点击编辑会触发$emit接受
    handelEditDepts(node) {
      this.isShowAddDepts = true // 显示弹层
      this.currentNode = node
      this.$refs.addDept.getUserDetailById(node.id)
    },
    async getDepartments() {
      this.loading = true
      try {
        const res = await getDepartments()
        // 替换公司数据
        this.company = {
          name: res.companyName,
          manager: res.companyManage || '管理员',
          id: ''
        }
        // 替换部门数据（utils/index.js/transListToTree()）
        this.departs = transListToTree(res.depts, '')
        this.loading = false
      } catch (error) {
        console.log(error)
        this.loading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  .app-container {
    width: 850px;
    border: 1px solid red;
    margin: 50px auto;
  }
}
</style>

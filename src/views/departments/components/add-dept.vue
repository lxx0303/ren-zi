<template>
  <!-- 新增部门的弹层 -->
  <el-dialog
    :title="`${showTitle}部门[${currentNode.name}]`"
    :visible="isShowAddDepts"
    @close="close"
  >
    <!-- 表单组件  el-form   label-width设置label的宽度   -->
    <!-- 匿名插槽 -->
    <el-form ref="form" label-width="120px" :model="formData" :rules="rules">
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="formData.name"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input
          v-model="formData.code"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select
          v-model="formData.manager"
          style="width: 80%"
          placeholder="请选择"
          @focus="getEmployeeSimple"
        >
          <!-- 需要循环生成选项   这里做一下简单的处理 显示的是用户名 存的也是用户名-->
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :value="item.username"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input
          v-model="formData.introduce"
          style="width: 80%"
          placeholder="1-300个字符"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <!-- 列被分为24 -->
      <el-col>
        <el-button type="primary" size="small" @click="submit">确定</el-button>
        <el-button size="small" @click="close">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import {
  addDepartments,
  getDepartments,
  getDepartDetail,
  updateDepartments
} from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'

export default {
  name: 'AddDept',
  props: {
    isShowAddDepts: {
      type: Boolean,
      default: false
    },
    currentNode: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 部门名称
    const checkName = async(rule, value) => {
      // 当前输入的Name值  是否跟同级的节点有重复的
      // 1、获取所有的部门数据
      const { depts } = await getDepartments()
      // 找出当前点击部门的子部门数据（pid=当前点击部门的ID）
      let currentChildren = null
      if (this.formData.id) {
        // 当前节点的兄弟节点  && 不包括自己
        currentChildren = depts.filter((item) => {
          return (
            // 把自己过滤掉
            item.pid === this.currentNode.pid && item.id !== this.currentNode.id
          )
        })
      } else {
        // 当前点击节点的儿子节点
        currentChildren = depts.filter((item) => {
          return item.pid === this.currentNode.id
        })
      }
      // value值是否和筛选出来的数据结果里面的name有重读
      const isRepeat = currentChildren.some((item) => item.name === value)
      // return promise拿到校验结果
      if (isRepeat) {
        return Promise.reject('部门名称重复')
      }
    }
    // 部门编码
    const checkCode = async(rule, value) => {
      // 1、获取所有的部门数据
      const { depts } = await getDepartments()
      // 检查编码是否重复
      let isRepeat = null
      if (this.formData.id) {
        isRepeat = depts.some(
          (item) => item.code === value && item.id !== this.currentNode.id
        )
      } else {
        isRepeat = depts.some((item) => item.code === value)
      }
      // 如果重复， return reject  状态的promise，表示表单校验失败
      if (isRepeat) {
        return Promise.reject('部门编码重复')
      }
    }
    return {
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      },
      // 定义校验规则
      rules: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '部门名称要求1-50个字符',
            trigger: 'blur'
          },
          {
            validator: checkName,
            trigger: 'blur'
          }
        ],
        code: [
          { required: true, message: '部门编码不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '部门编码要求1-50个字符',
            trigger: 'blur'
          },
          {
            validator: checkCode,
            trigger: 'blur'
          }
        ],
        manager: [
          { required: true, message: '部门负责人不能为空', trigger: 'blur' }
        ],
        introduce: [
          { required: true, message: '部门介绍不能为空', trigger: 'blur' },
          {
            trigger: 'blur',
            min: 1,
            max: 300,
            message: '部门介绍要求1-50个字符'
          }
        ]
      },
      peoples: [] // 接收获取的员工简单列表的数据
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑' : '新增'
    }
  },
  methods: {
    // 获取员工简单列表数据
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple()
    },
    async getUserDetailById(id) {
      this.formData = await getDepartDetail(id)
    },
    async submit() {
      await this.$refs.form.validate()
      // 根据formdata的id区分添加数据的场景
      if (this.formData.id) {
        await updateDepartments(this.formData)
      } else {
        await addDepartments({
          ...this.formData, // 白哦但数据对象展开
          pid: this.currentNode.id
        })
      }
      this.$message.success(`${this.showTitle}成功`)
      this.$emit('getDepartments')
      this.close()
    },
    close() {
      this.$refs.form.resetFields()
      this.formData = {}
      this.$emit('update:isShowAddDepts', false)
    }
  }
}
</script>

<style></style>

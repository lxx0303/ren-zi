<template>
  <div>
    <el-upload
      action="#"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-change="changeFile"
      :before-upload="beforeUpload"
      :http-request="upload"
      :file-list="fileList"
      :limit="1"
      :class="{ completed: isCompleted }"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <el-progress v-if="showPercent" :percentage="percentage" />
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import COS from 'cos-js-sdk-v5'
// 需要实例化
const cos = new COS({
  SecretId: 'AKIDrY2IKwKUP8f0A7pJZZKq8C42mKcfiX8V',
  SecretKey: 'B9tOfhV8YieMp32qQBi3B5lJm36vXx96'
})
// 实例化的包 已经具有了上传的能力 可以上传到该账号里面的存储桶了
export default {
  name: 'UploadImage',
  data() {
    return {
      showPercent: false,
      percentage: 0,
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: [
        {
          url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202005%2F29%2F20200529083215_quaod.thumb.1000_0.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1662275549&t=840e1c83f5c88de6d6cb84472e2fb297'
        }
      ]
    }
  },
  computed: {
    isCompleted() {
      return this.fileList.length >= 1
    }
  },
  created() {},
  methods: {
    changeFile(file, fileList) {
      // 直接push会添加重复
      // fileList最终的文件列表
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
      // file是点击的文件
      // 如果uid一致，需要被删除
      // this.fileList = this.fileList.filter((item) => item.uid !== file.uid)

      // 也可以这样写（形参fileList是表示的是删除后的结果）
      this.fileList = fileList
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    beforeUpload(file) {
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!types.includes(file.type)) {
        this.$message.error('文件类型不匹配')
        return false
      }

      // 判断文件大小
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        this.$message.error('文件太大了')
        return false
      }
      this.showPercent = true
    },
    // 进行上传操作
    upload(params) {
      const { file } = params
      //   console.log(params.file)
      // 执行上传操作
      if (!file) return
      cos.putObject(
        {
          Bucket: 'lxx-1313213543 ', // 存储桶
          Region: 'ap-nanjing', // 地域
          Key: file.name, // 文件名
          Body: file, // 要上传的文件对象
          StorageClass: 'STANDARD', // 上传的模式类型 直接默认 标准模式即可
          // 上传到腾讯云 =》 哪个存储桶 哪个地域的存储桶 文件  格式  名称 回调
          onProgress: ({ percent }) => {
            this.percentage = percent * 100
          }
        },
        (err, data) => {
          // data返回数据之后 应该如何处理
          if (err) {
            return this.$message.error(err?.message || '上传出错')
          }
          this.fileList.forEach((item) => {
            if (item.uid === file.uid) {
              item.url = `http://${data.Location}`
              item.upload = true
            }
          })
          setTimeout(() => {
            this.showPercent = false
            this.percentage = false
          }, 1500)
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
.completed {
  ::v-deep .el-upload--picture-card {
    display: none;
  }
}
</style>

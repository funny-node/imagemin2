const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const imageminMozjpeg = require('imagemin-mozjpeg')
const fs = require('fs-extra')
const path = require('path')
const walkSync = require('walk-sync')
const { sourceDir, destDir } = require('./config')

/**
 * 压缩图片文件（仅限 png 和 jpg 格式）到指定路径，并生成一个新文件
 */
function minify(sourcePath, destination) {
  return new Promise((resolve, reject) => {
    imagemin([sourcePath], {
      destination,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8]
        }),
        // 渐进式 JPEG 处理，可以用 is-progressive-cli 包来判断属否属于渐进式 JPEG
        imageminMozjpeg({
          quality: 70,
        }),
      ]
    }).then(() => {
      resolve()
    }).catch(err => {
      reject(sourcePath)
    })
  })
}

;(async function() {
  // 获取源文件夹所有文件
  const files = walkSync(sourceDir, {
    ignore: ['node_modules'],
    directories: false
  })

  for (let item of files) {
    const ext = path.extname(item)
    
    // 只压缩 png 和 jpg
    if (ext === '.png' || ext === '.jpg') {
      // 压缩图片
      const sourcePath = path.join(sourceDir, item)
      const destination = path.dirname(path.join(destDir, item))

      try {
        await minify(sourcePath, destination)
      } catch (err) {
        console.log(`压缩图片 ${sourcePath} 出现错误！`)
      }
    } else {
      const sourcePath = path.join(sourceDir, item)
      const destPath = path.join(destDir, item)

      try {
        fs.copySync(sourcePath, destPath)
      } catch (err) {
        console.log(`复制文件 ${sourcePath} 出现错误！`)
      }
    }
  }

  // 检查源文件是否都在生成文件夹中了
  files.forEach(item => {
    const destPath = path.join(destDir, item)
    const isExist = fs.existsSync(destPath)

    if (!isExist) {
      console.log(`文件 ${path.join(sourceDir, item)} 没有在新文件夹中生成！` )
    }
  })

  console.log('----------')
  console.log('完成！')
})()
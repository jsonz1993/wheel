import CopyText from './copyText';

document.getElementById('btn').addEventListener('click', function() {
    new CopyText({
        text: '这是复制的文案',
        success() {
            console.log('成功')
        },
        error() {
            console.log('失败');
        }
    });
})
import { notification } from 'antd';

const showSuccessMessage = (content, translate) => {
    notification.success({
        message: 'Thành công',
        description: content,
    });
};

const showErrorMessage = (content, translate) => {
    notification.error({
        message: 'Lỗi',
        description: content,
    });
};

const showWarningMessage = (content, translate) => {
    notification.warning({
        message: 'Cảnh báo',
        description: content,
    });
};

export { showErrorMessage, showWarningMessage, showSuccessMessage };

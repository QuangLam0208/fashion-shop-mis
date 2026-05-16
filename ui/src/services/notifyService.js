import { notification } from 'antd';

const showSucsessMessage = (content, translate) => {
    notification.success({
        message: translate?.t(`${translate.ns}:success`, 'Success') || 'Thành công',
        description: content,
    });
};

const showErrorMessage = (content, translate) => {
    notification.error({
        message: translate?.t(`${translate.ns}:error`, 'Error') || 'Lỗi',
        description: content,
    });
};

const showWarningMessage = (content, translate) => {
    notification.warning({
        message: translate?.t(`${translate.ns}:error`, 'Error Message') || 'Cảnh báo',
        description: content,
    });
};

export { showErrorMessage, showWarningMessage, showSucsessMessage };

import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import moment from 'moment';
import forge from 'node-forge';
import qs from 'query-string';
import {
    AppConstants,
    CurrentcyPositions,
    DATE_FORMAT_DISPLAY,
    DATE_FORMAT_END_OF_DAY_TIME,
    DATE_FORMAT_VALUE,
    DATE_FORMAT_ZERO_TIME,
    DATE_SHORT_MONTH_FORMAT,
    DEFAULT_FORMAT,
    DEFAULT_TABLE_ITEM_SIZE,
    THEMES,
} from './constants';
import { showErrorMessage, showSuccessMessage } from './notifyService';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export * from './apiHelper';
export * from './can-use-dom';
export * from './create-ctx';
export * from './crypto';
export * from './dayHelper';
export * from './get-scroll-parent';
export * from './intlHelper';
export * from './localStorage';
export * from './notifyService';
export * from './sessionStorage';
export * from './userService';

export const convertGlobImportToObject = (modules) =>
    modules
        .filter((module) => !!module.default)
        .reduce(
            (rs, cur) => ({
                ...rs,
                [cur.default.name]: cur.default,
            }),
            {},
        );

export const convertGlobImportToArray = (modules) =>
    modules.filter((module) => !!module.default).map((module) => module.default);

export const destructCamelCaseString = (string) => {
    const arrString = [...string];
    const newArrString = [];
    arrString.forEach((char, index) => {
        if (char.charCodeAt(0) > 90) {
            newArrString.push(char);
        } else {
            index && newArrString.push('-');
            newArrString.push(char.toLowerCase());
        }
    });
    return newArrString.join('');
};

export const convertUtcToLocalTime = (utcTime, inputFormat = DATE_FORMAT_DISPLAY, format = DATE_FORMAT_DISPLAY) => {
    try {
        if (utcTime) return moment(moment.utc(utcTime, inputFormat).toDate()).format(format);
        return '';
    } catch (err) {
        return '';
    }
};
export function convertUtcToIso(date) {
    return dayjs(convertUtcToLocalTime(date, DEFAULT_FORMAT, DEFAULT_FORMAT), DEFAULT_FORMAT);
}

export const getBrowserTheme = () => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return isDark ? THEMES.DARK : THEMES.LIGHT;
};

export const makeURL = (baseURL, params, pathParams) => {
    for (let key of Object.keys(pathParams || {})) {
        const keyCompare = `:${key}`;
        if (baseURL.indexOf(keyCompare) !== -1) {
            baseURL = baseURL.replace(keyCompare, pathParams[key]);
        }
    }

    if (params) {
        baseURL = baseURL + '?' + qs.stringify(params);
    }

    return baseURL;
};

export const parseURL = (url) => {
    try {
        return new URL(url);
    } catch (error) {
        return '';
    }
};

export const getYTEmbedLinkFromYTWatchLink = (watchLink) => {
    if (!watchLink) {
        return '';
    }

    const { v } = qs.parse(parseURL(watchLink).search);
    return v ? `https://www.youtube.com/embed/${v}?autoplay=1&mute=1` : watchLink;
};

export const getYoutubeVideoID = (url) => {
    let pattern = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
    return pattern.exec(url)?.[3];
};

export const formatNumber = (value, setting) => {
    if (value) {
        const decimalPosition = value.toString().indexOf('.');
        if (decimalPosition > 0) {
            const intVal = value.toString().substring(0, decimalPosition);
            const decimalVal = value.toString().substring(decimalPosition + 1);
            return `${intVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimalVal}`;
        }
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else if (value === 0) return 0;
    return '';
};

export const formatDateString = (dateString, formatDate = DATE_SHORT_MONTH_FORMAT) => {
    return dayjs(dateString).format(formatDate);
};
export const formatDateStringLocal = (dateString, formatDate = DATE_SHORT_MONTH_FORMAT) => {
    return dayjs(dateString).format(formatDate);
};
export const formatEndDate = (dueDate, formatDate = DEFAULT_FORMAT) => {
    const dueDateWithTime = dayjs(dueDate).set('hour', 23).set('minute', 59).set('second', 59);

    const dueDateInUTC = dueDateWithTime.utc();
    const dueDateMinus7Hours = dueDateWithTime.subtract(7, 'hours');

    const formattedDueDateInUTC = dueDateInUTC.format(formatDate);
    return formattedDueDateInUTC;
};

export const calculateTimes = (data) => {
    return data.reduce(
        (acc, item) => {
            if (item?.projectTaskInfo?.kind === 1 || item?.projectTaskInfo?.kind === 3) {
                acc.upTime += item?.totalTime;
            } else if (item?.projectTaskInfo?.kind === 2) {
                acc.bugTime += item?.totalTime;
            }
            return acc;
        },
        { upTime: 0, bugTime: 0 },
    );
};

export const calculateTrainingTimes = (data) => {
    let value = 0;
    return data.reduce(
        (acc, item) => {
            acc.completeTime += item?.learnCourseTime;
            acc.assignedTime += item?.assignedCourseTime;
            value +=
                item?.learnCourseTime === 0 || item?.assignedCourseTime === 0
                    ? 0
                    : item?.assignedCourseTime - item?.learnCourseTime;
            acc.differenceTime = value < 0 ? value : 0;
            return acc;
        },
        { completeTime: 0, assignedTime: 0, differenceTime: 0 },
    );
};

export const removeAccents = (str) => {
    if (str)
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    return str;
};

export const validateUsernameForm = (rule, username) => {
    return /^[a-z0-9_]+$/.exec(username)
        ? Promise.resolve()
        : Promise.reject('Username chỉ bao gồm các ký tự a-z, 0-9, _');
};

export const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

export function ensureArray(value) {
    if (value === null || value === undefined) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    return [value];
}

export const removePathParams = (paths) => {
    return ensureArray(paths).map((path) => {
        if (typeof path !== 'string') return path;
        return path.replaceAll(/\/:[a-zA-Z]+/g, '');
    });
};

export const validatePermission = (
    requiredPermissions = [],
    userPermissions = [],
    requiredKind,
    excludeKind = [],
    userKind,
    profile,
    path,
    separate,
    apiUrl,
) => {
    if (ensureArray(excludeKind).length > 0) {
        if (ensureArray(excludeKind).some((kind) => kind == userKind)) return false;
    }
    if (requiredKind) {
        if (requiredKind !== userKind) return false;
    }
    if (!requiredPermissions || requiredPermissions?.length == 0) return true;
    if (userPermissions.some((code) => requiredPermissions.includes(code))) {
        return true;
    }
    let permissionsSavePage = [];
    if (separate && requiredPermissions.length > 0) {
        permissionsSavePage.push(path?.type === 'create' ? requiredPermissions[0] : requiredPermissions[1]);
    } else {
        permissionsSavePage = requiredPermissions;
    }
    return removePathParams(permissionsSavePage).every((item) => userPermissions?.includes(item?.replace(apiUrl, '/')));
};

export function generatePassword(options) {
    const { length, numbers, uppercase, lowercase, symbols, strict } = options;

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    let validChars = '';

    if (uppercase) {
        validChars += uppercaseChars;
    }
    if (lowercase) {
        validChars += lowercaseChars;
    }
    if (numbers) {
        validChars += numberChars;
    }
    if (symbols) {
        validChars += symbolChars;
    }

    if (validChars.length === 0) {
        throw new Error('At least one character type should be selected.');
    }

    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * validChars.length);
        password += validChars.charAt(randomIndex);
    }

    if (strict) {
        // Ensure at least one character of each type is present
        if (uppercase && !/[A-Z]/.test(password)) {
            return generatePassword(options);
        }
        if (lowercase && !/[a-z]/.test(password)) {
            return generatePassword(options);
        }
        if (numbers && !/\d/.test(password)) {
            return generatePassword(options);
        }
        if (symbols && !/[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(password)) {
            return generatePassword(options);
        }
    }

    return password;
}
export function copyToClipboard1(text) {
    var textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
}

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const formatMoney = (value, setting = {}) => {
    if ((value || value === 0) && !isNaN(value)) {
        const groupSeparator = setting.groupSeparator || '.';
        const decimalSeparator = setting.decimalSeparator || ',';
        const currentcy = setting.currentcy || 'đ';
        const currentcyPosition = setting.currentcyPosition || CurrentcyPositions.BACK;
        value = setting.currentDecimal ? (+value).toFixed(setting.currentDecimal) : (+value).toFixed(2);
        // value = (+value).toFixed(0);
        const decimalPosition = value.toString().indexOf('.');
        if (decimalPosition > 0) {
            const intVal = value.toString().substring(0, decimalPosition);
            const decimalVal = value.toString().substring(decimalPosition + 1);
            value = `${intVal.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator)}${decimalSeparator}${decimalVal}`;
        } else {
            value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
        }
        if (currentcyPosition === CurrentcyPositions.FRONT) {
            return `${currentcy} ${value}`;
        } else {
            return `${value} ${currentcy}`;
        }
    }
    return '';
};

export const priceValue = (value) => {
    return formatMoney(value, {
        groupSeparator: ',',
        currencySymbol: 'đ',
        currentcyPosition: 'BACK',
        currentDecimal: '0',
    });
};

export const encryptValue = (secretKey, inputStr) => {
    try {
        // Parse the secret key
        const key = CryptoJS.enc.Utf8.parse(secretKey);

        // Encrypt the input string
        const encrypted = CryptoJS.AES.encrypt(inputStr, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });

        const encryptedBase64 = encrypted.toString();
        return encryptedBase64;
    } catch (error) {
        console.error(error);
    }
    return null;
};

export const decryptValue = (secretKey, encryptedStr) => {
    try {
        let decrypted = CryptoJS.AES.decrypt(encryptedStr, CryptoJS.enc.Utf8.parse(secretKey), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        return decryptedText;
    } catch (error) {
        console.error(error);
    }
    return null;
};

export const encryptRSA = (publicKeyStr, data) => {
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyStr
        .match(/.{1,64}/g)
        .join('\n')}\n-----END PUBLIC KEY-----`;
    try {
        const publicKey = forge.pki.publicKeyFromPem(formatPemPrivateKey(publicKeyPem));
        const encryptedBytes = publicKey.encrypt(data, 'RSAES-PKCS1-V1_5');
        return forge.util.encode64(encryptedBytes);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const decryptRSA = (privateKeyStr, encryptedData) => {
    // const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyStr
    //     .match(/.{1,64}/g)
    //     .join('\n')}\n-----END PRIVATE KEY-----`;
    try {
        const privateKey = forge.pki.privateKeyFromPem(formatPemPrivateKey(privateKeyStr));
        const decryptedBytes = privateKey.decrypt(forge.util.decode64(encryptedData), 'RSAES-PKCS1-V1_5');
        return decryptedBytes;
    } catch (error) {
        console.error('error decryptRSA: ', error);
        return null;
    }
};

export const orderNumber = (pagination, index, size = DEFAULT_TABLE_ITEM_SIZE) => {
    const page = pagination?.current ? pagination.current - 1 : 1;
    return page * size + (index + 1);
};

export function convertToCamelCase(str) {
    str = str
        .normalize('NFD') // chuyển chuỗi sang unicode tổ hợp
        .replace(/[\u0300-\u036f]/g, ''); // xóa các ký tự dấu sau khi tách tổ hợp

    str = str.replace(/[đĐ]/g, 'd');
    str = str.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
    str = str.replace(/(\s+)/g, '');

    // return
    return str;
}

export const convertMinuteToHour = (minu) => {
    let result = minu / 60;
    if (result % 1 !== 0) {
        return `${parseFloat(result.toFixed(2))}h`;
    } else {
        return `${result.toFixed(0)}h`;
    }
};

export const sortArray = (data, name) => {
    const sortedDataCustom = data.sort((a, b) => b[name] - a[name]);
    return sortedDataCustom;
};

const formatPemPrivateKey = (privateKeyStr) => {
    const hasPemHeader = privateKeyStr.includes('-----BEGIN PRIVATE KEY-----');
    const hasPemFooter = privateKeyStr.includes('-----END PRIVATE KEY-----');

    if (!hasPemHeader || !hasPemFooter) {
        const base64Key = privateKeyStr.replace(/\n|\r/g, '');
        const formattedKey = base64Key.match(/.{1,64}/g).join('\n');
        return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    }
    return privateKeyStr;
};

export const removePemFormat = (privateKeyStr) => {
    const hasPemHeader = privateKeyStr.includes('-----BEGIN PRIVATE KEY-----');
    const hasPemFooter = privateKeyStr.includes('-----END PRIVATE KEY-----');

    let cleanedKeyStr = privateKeyStr;

    if (hasPemHeader && hasPemFooter) {
        cleanedKeyStr = cleanedKeyStr
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .trim();
    }

    return cleanedKeyStr;
};

export const formatDateLocalToUtc = (dueDate, formatDate = DEFAULT_FORMAT, lastDay = true) => {
    const dueDateWithTime = dayjs(dueDate).set('hour', 0).set('minute', 0).set('second', 0);

    // const dueDateInUTC = dueDateWithTime.utc();
    const dueDateMinus7Hours = lastDay ? dueDateWithTime.subtract(7, 'hours') : dueDate.subtract(7, 'hours');

    const formattedDueDateInUTC = dueDateMinus7Hours.format(formatDate);
    return formattedDueDateInUTC;
};

export const beforeUpload = (file) => {
    const maxFileSize = 2 * 1024 * 1024; // Giới hạn là 2MB
    const formatFile = ['png', 'jpg', 'jpeg', 'jfif'];
    const lastDotIndex = file.name.lastIndexOf('.');

    const fileExtension = lastDotIndex !== -1 ? file.name.substring(lastDotIndex + 1) : '';
    console.log(fileExtension);
    if (!formatFile.includes(fileExtension)) {
        showErrorMessage('Sai định dạng file!');
        return false;
    }
    if (file.size > maxFileSize) {
        // Hiển thị thông báo lỗi nếu file vượt quá kích thước giới hạn
        showErrorMessage('File phải nhỏ hơn 2MB!');
        return false;
    }
    return true;
};

export const copyToClipboard = (text, successText, errorText) => {
    const dataToCopy = !!text;
    if (dataToCopy) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                showSuccessMessage(successText || 'Sao chép thành công');
            })
            .catch((err) => {
                console.error(errorText || 'Sao chép thất bại', err);
                showErrorMessage(errorText || 'Sao chép thất bại');
            });
    } else showErrorMessage('Không có gì để sao chép');
};

export const innerHeight = window.innerHeight;

export const formatMoneyValue = (value, currentcy = 'đ', groupSeparator = ',', decimalSeparator = '.') => {
    return formatMoney(value ? value : 0, {
        groupSeparator: groupSeparator,
        decimalSeparator: decimalSeparator,
        currentcy: currentcy,
        currentDecimal: '0',
    });
};

export const sumMoney = (data, kind) => {
    const totalAmount = data?.reduce((accumulator, item) => {
        if (item?.kind === kind) return accumulator + Number(item.money);
        else return accumulator;
    }, 0);

    return totalAmount;
};

export const validCheckFields = (fieldsToSet) => {
    const validFields = Object.fromEntries(
        Object.entries(fieldsToSet).filter(([_, value]) => value !== null && value !== undefined),
    );
    const checkValue = Object.keys(validFields).length > 0 ? validFields : false;
    return checkValue;
};
export const checkUserName = (_, value) => {
    if (value) {
        const usernameRegex = /^[a-z0-9_]{2,20}$/;
        if (!usernameRegex.test(value)) {
            return Promise.reject('Username không hợp lệ');
        }
    } else return Promise.reject('Username không hợp lệ');
    return Promise.resolve();
};
export const checkPassword = (_, value) => {
    if (value) {
        const passwordRegex = /^[A-Za-z\d!@#$%^&*()+\-=]{6,}$/;
        if (!passwordRegex.test(value)) {
            return Promise.reject('Mật khẩu phải có ít nhất 6 ký tự');
        }
    }
    return Promise.resolve();
};
export const checkPhone = (_, value) => {
    const phoneRegex = /^0[35789][0-9]{8}$/; // Regex để kiểm tra số điện thoại có 10 chữ số
    if (!phoneRegex.test(value)) {
        return Promise.reject('Số điện thoại không hợp lệ !');
    }
    return Promise.resolve();
};
export const validateDate = (_, value) => {
    const date = dayjs(formatDateString(new Date(), DEFAULT_FORMAT), DATE_FORMAT_VALUE);
    if (date && value && value.isAfter(date)) {
        return Promise.reject('Ngày sinh phải nhỏ hơn ngày hiện tại');
    }
    return Promise.resolve();
};
export const checkEmail = (_, value) => {
    const emailRegex = /^[a-z0-9.]+@[a-z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(value)) {
        return Promise.reject('Email không hợp lệ');
    }
    return Promise.resolve();
};
export const checkFullName = (_, value) => {
    if (value) {
        const lowerCaseValue = value && value.toLowerCase().trim();
        const fullNameRegex =
            /^[a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]+(?: [a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]+)*$/u;

        if (!fullNameRegex.test(lowerCaseValue)) {
            return Promise.reject('Họ tên không hợp lệ');
        }
    } else return Promise.reject('Họ tên không hợp lệ');

    return Promise.resolve();
};

export function convertRTE(value, key, apiUrl) {
    return value?.replace(new RegExp(AppConstants(apiUrl).contentRootUrl, 'g'), key);
}

export function replaceURLPlaceholder(value, key, apiUrl) {
    return value?.replace(new RegExp(key, 'g'), AppConstants(apiUrl).contentRootUrl);
}

export const moveArrayElement = (arr = [], from, to) => {
    if (!Array.isArray(arr)) throw new Error('The first argument must be an array.');

    const copy = arr.slice();
    copy.splice(to, 0, copy.splice(from, 1)[0]);

    return copy;
};

export function parseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
}

export function generateUniqueId() {
    const timestamp = dayjs().format('hmmss'); // Lấy giờ, phút, và giây (đảm bảo không bắt đầu bằng số 0)
    const randomPart = Math.floor(100 + Math.random() * 900); // Tạo số ngẫu nhiên 3 chữ số (100-999)

    return Number(`${timestamp}${randomPart}`);
}

export const formatDateToZeroTime = (date) => {
    const dateString = dayjs(date).format(DATE_FORMAT_ZERO_TIME);
    return dayjs(dateString, DEFAULT_FORMAT).utc().format(DEFAULT_FORMAT);
};

export const formatDateToEndOfDayTime = (date) => {
    const dateString = dayjs(date).format(DATE_FORMAT_END_OF_DAY_TIME);
    return dayjs(dateString, DEFAULT_FORMAT).utc().format(DEFAULT_FORMAT);
};

export const renderImageUrl = (imageUrl, apiUrl) => {
    return imageUrl ? `${AppConstants(apiUrl).contentRootUrl}${imageUrl}` : null;
};
export const formatMinutesToHoursAndMinutes = (totalMinutes) => {
    if (typeof totalMinutes !== 'number' || totalMinutes < 0) return '0p';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours > 0 ? `${hours}h` : ''} ${minutes > 0 ? `${minutes}p` : ''}`.trim();
};

export const formatDateToZeroTimeUTC = (date) => {
    const dateString = formatDateString(date, DEFAULT_FORMAT);
    return dayjs(dateString, DEFAULT_FORMAT).utc().format(DATE_FORMAT_ZERO_TIME);
};

export function limitCharacters(value, numOfCharacters) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    if (value?.length <= numOfCharacters) {
        return value; // Trả về chuỗi không thay đổi nếu số ký tự nhỏ hơn hoặc bằng numOfCharacters
    } else {
        return value.slice(0, numOfCharacters) + '...'; // Trả về một phần của chuỗi với số ký tự được giới hạn
    }
}

export function generateColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`; // Đảm bảo mã màu có 6 ký tự
}

export function isQuillHtml(html) {
    if (!html) return false;

    return /ql-(align|indent|size|color|bg|font|direction)/.test(html);
}
export function normalizeQuillHtml(html) {
    if (!html || typeof html !== 'string') return html;

    var container = document.createElement('div');
    container.innerHTML = html;

    /* =========================
       INDENT (NON-LIST BLOCK)
    ========================= */
    container.querySelectorAll('[class*="ql-indent-"]').forEach(function (el) {
        if (el.tagName === 'LI') return; // list xử lý riêng

        var indentClass = Array.from(el.classList).find(function (c) {
            return c.indexOf('ql-indent-') === 0;
        });

        if (!indentClass) return;

        var level = Number(indentClass.replace('ql-indent-', ''));
        if (!isNaN(level)) {
            el.style.marginLeft = level * 2 + 'em';
        }

        el.classList.remove(indentClass);
    });

    /* =========================
       BACKGROUND → <mark>
    ========================= */
    container
        .querySelectorAll('span[style*="background-color"]')
        .forEach(function (span) {
            var bg = span.style.backgroundColor;
            if (!bg) return;

            var mark = document.createElement('mark');
            mark.setAttribute('data-color', bg);
            mark.innerHTML = span.innerHTML;

            span.replaceWith(mark);
        });

    /* =========================
       NORMALIZE LISTS
    ========================= */
    normalizeQuillLists(container);

    /* =========================
       REMOVE EMPTY SPAN
    ========================= */
    container.querySelectorAll('span').forEach(function (span) {
        if (
            span.attributes.length === 0 &&
            span.textContent &&
            span.textContent.trim()
        ) {
            span.replaceWith(document.createTextNode(span.textContent));
        }
    });

    /* =========================
       CLEAN EMPTY ATTR
    ========================= */
    container.querySelectorAll('*').forEach(function (el) {
        if (el.getAttribute('class') === '') el.removeAttribute('class');
        if (el.getAttribute('style') === '') el.removeAttribute('style');
    });

    /* =========================
       DIV → P
    ========================= */
    container.querySelectorAll('div').forEach(function (div) {
        if (
            div.childNodes.length === 1 &&
            div.firstChild.nodeType === 3
        ) {
            var p = document.createElement('p');
            p.textContent = div.textContent || '';
            div.replaceWith(p);
        }
    });

    return container.innerHTML;
}
function normalizeQuillLists(container) {
    container.querySelectorAll('ol, ul').forEach(function (rootList) {
        var items = Array.from(rootList.children).filter(function (node) {
            return node.tagName === 'LI';
        });

        var stack = [
            {
                level: 0,
                list: rootList,
                li: null,
            },
        ];

        items.forEach(function (li) {
            var indentClass = Array.from(li.classList).find(function (c) {
                return c.indexOf('ql-indent-') === 0;
            });

            var level = indentClass
                ? Number(indentClass.replace('ql-indent-', ''))
                : 0;

            if (indentClass) li.classList.remove(indentClass);

            // pop stack nếu level giảm
            while (stack.length > level + 1) {
                stack.pop();
            }

            // tạo nested list nếu level tăng
            if (level + 1 > stack.length) {
                var parentLi = stack[stack.length - 1].li;
                if (!parentLi) return;

                var nested = document.createElement(
                    rootList.tagName.toLowerCase(),
                );
                parentLi.appendChild(nested);

                stack.push({
                    level: level,
                    list: nested,
                    li: null,
                });
            }

            var current = stack[stack.length - 1];
            current.list.appendChild(li);
            current.li = li;
        });
    });
}
export function prepareForEditor(html) {
    if (!html) return '';
    return isQuillHtml(html) ? normalizeQuillHtml(html) : html;
}

export function resolveSrc(src, apiUrl) {
    if (!src) return '';

    if (src.includes('{MEDIA_DOMAIN}')) {
        return src.replace(/\{MEDIA_DOMAIN\}/g, AppConstants(apiUrl).contentRootUrl);
    }

    if (src.startsWith('http')) {
        return src;
    }

    return `${AppConstants(apiUrl).contentRootUrl}${src}`;
}

export function transformContent(htmlContent){
    if (!htmlContent) return '';
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    doc.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        img.src = resolveSrc(src);
    });
    doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach(el => {
        if (!el.style.fontSize) {
            el.style.fontSize = '1rem';
        }
    });

    return doc.body.innerHTML;
}
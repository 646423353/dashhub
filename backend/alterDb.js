import { dbHelper } from './src/config/database.js';

async function alterDb() {
    try {
        await dbHelper.query("ALTER TABLE projects ADD COLUMN cooperation_form TEXT COMMENT '简洁合作形式概述';");
        console.log("Added cooperation_form");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') console.log("cooperation_form exists");
        else console.error(err);
    }

    try {
        await dbHelper.query("ALTER TABLE projects ADD COLUMN use_dashtro TINYINT(1) DEFAULT 0 COMMENT '是否使用 Dashtro 分账(1=是,0=否)';");
        console.log("Added use_dashtro");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') console.log("use_dashtro exists");
        else console.error(err);
    }

    try {
        await dbHelper.query("ALTER TABLE projects ADD COLUMN dashtro_agreement TEXT COMMENT 'Dashtro 的分账协议详情内容';");
        console.log("Added dashtro_agreement");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') console.log("dashtro_agreement exists");
        else console.error(err);
    }

    process.exit(0);
}

alterDb();

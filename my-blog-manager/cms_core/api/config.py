from fastapi import APIRouter, Body
from pathlib import Path
from datetime import datetime
from typing import Any
import json
import shutil

router = APIRouter()
PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = PROJECT_ROOT / 'siteConfig.ts'

def read_config():
    source = CONFIG_PATH.read_text(encoding='utf-8')
    return json.loads(source.split('export const siteConfig =', 1)[1].strip().rstrip(';'))

@router.get('/get')
def get_site_config():
    try:
        return {'success': True, 'data': read_config()}
    except (OSError, ValueError, IndexError) as error:
        return {'success': False, 'message': f'读取配置失败: {error}'}

@router.post('/update')
def update_site_config(payload: dict[str, Any] = Body(...)):
    try:
        data = read_config()
        updates = payload.get('updates', {})
        if not isinstance(updates, dict) or not updates:
            return {'success': False, 'message': '没有收到需要更新的数据'}
        for key, value in updates.items():
            if key in data or key in {'picBedName', 'picBedUrl', 'picBedToken'}:
                data[key] = value
        backup = PROJECT_ROOT / '.local' / 'config-backups'
        backup.mkdir(parents=True, exist_ok=True)
        shutil.copy2(CONFIG_PATH, backup / (datetime.now().strftime('%Y%m%d-%H%M%S-%f') + '.ts'))
        CONFIG_PATH.write_text('// Site settings managed by the local CMS.\nexport const siteConfig = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
        return {'success': True, 'message': '本地设置已保存，请同步 Blog。'}
    except (OSError, ValueError, IndexError) as error:
        return {'success': False, 'message': f'保存配置失败: {error}'}

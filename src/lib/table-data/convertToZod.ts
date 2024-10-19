import z, { type ZodTypeAny } from 'zod';
import type { ColumnDefinition, ColumnValue, Config, ValueTypes } from './types';

export function convert(colDefs: ColumnDefinition[]) {
	const converted: { [k: string]: z.ZodTypeAny } = {};
	for (const def of colDefs) {
		let defAsZod: ZodTypeAny;
		switch (def.type) {
			case 'text':
				defAsZod = z.string({ description: def.description ?? undefined });
				break;

			case 'number':
				defAsZod = z.number({ description: def.description ?? undefined });
				break;

			case 'integer':
				defAsZod = z.number({ description: def.description ?? undefined }).int();
				break;

			case 'boolean':
				defAsZod = z.boolean({ description: def.description ?? undefined });
				break;

			case 'enum':
				if (!def.description) throw new Error('no select items');
				defAsZod = z.enum(def.description.split(/\s*,\s*/) as [string, ...string[]]);
				break;

			case 'fullname':
				defAsZod = z.object(
					{ first: z.string(), middle: z.union([z.string(), z.null()]), last: z.union([z.string(), z.null()]) },
					{ description: def.description ?? undefined }
				);
				break;

			case 'date':
				defAsZod = z.object(
					{ year: z.number().int(), month: z.number().int(), day: z.number().int() },
					{ description: def.description ?? undefined }
				);
				break;

			case 'time':
				defAsZod = z.object(
					{
						hour: z.number().int(),
						minute: z.number().int(),
						second: z.number().int()
					},
					{ description: def.description ?? undefined }
				);
				break;

			case 'address':
				defAsZod = z.object(
					{ country: z.union([z.string(), z.null()]), zipCode: z.union([z.string(), z.null()]), address: z.string() },
					{ description: def.description ?? undefined }
				);
				break;

			case 'address_jp':
				defAsZod = z.object(
					{ zipCode: z.string(), prefecture: z.string(), municipality: z.string(), others: z.string() },
					{ description: def.description ?? undefined }
				);
				break;

			case 'gender':
				defAsZod = z.enum(['male', 'female'], { description: def.description ?? undefined });
				break;

			default:
				throw new Error(`unknown column type: ${def.type}`);
		}
		if (!def.required) defAsZod = z.union([defAsZod, z.null()]);
		converted[def.key] = defAsZod;
	}
	const query = z.object(converted);
	return query;
}

const dateOrderKeys = { DMY: ['day', 'month', 'year'], YMD: ['year', 'month', 'day'], MDY: ['month', 'day', 'year'] };

// original: https://stackoverflow.com/a/2901298
function numberWithCommas(x: number) {
	return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
}

export function convertColumnKey(type: ValueTypes, srcKey: string, split: boolean = false) {
	if (!split) return [srcKey];
	if (type === 'fullname') return [`${srcKey}_first`, `${srcKey}_middle`, `${srcKey}_last`];
	if (type === 'date') return [`${srcKey}_year`, `${srcKey}_month`, `${srcKey}_day`];
	if (type === 'time') return [`${srcKey}_hour`, `${srcKey}_minute`, `${srcKey}_second`];
	if (type === 'address') return [`${srcKey}_country`, `${srcKey}_zip`, `${srcKey}_detail`];
	if (type === 'address_jp') return [`${srcKey}_zip`, `${srcKey}_pref`, `${srcKey}_muni`, `${srcKey}_other`];
	return [srcKey];
}

export function convertColumnValue(
	definition: ColumnDefinition,
	srcValue: ColumnValue | undefined,
	properties: Config,
	csv: boolean = false
): string[] {
	const { type, split } = definition;
	if (srcValue == null) return [''];
	if (type === 'text' || type === 'enum') return [srcValue as string];
	if (type === 'number' || type === 'integer')
		return [csv ? srcValue.toString() : numberWithCommas(srcValue as number)];
	if (type === 'boolean') return [csv ? (srcValue ? 'TRUE' : 'FALSE') : srcValue ? 'Yes' : 'No'];
	const obj = srcValue as { [k: string]: string | number | boolean | null };
	if (split) {
		if (type === 'fullname') return [obj.first as string, (obj.middle ?? '') as string, (obj.last ?? '') as string];
		if (type === 'date') return [obj.year!.toString(), obj.month!.toString(), obj.day!.toString()];
		if (type === 'time') return [obj.hour!.toString(), obj.minute!.toString(), obj.second!.toString()];
		if (type === 'address')
			return [(obj.country ?? '').toString(), (obj.zipCode ?? '').toString(), obj.address!.toString()];
		if (type === 'address_jp')
			return [
				obj.zipCode!.toString(),
				obj.prefecture!.toString(),
				obj.municipality!.toString(),
				obj.others!.toString()
			];
	} else {
		const { dateOrder, dateSeparator: d, timeSeparator: t } = properties;
		const lf = csv ? ' ' : '\n';
		if (type === 'fullname') return [[obj.first, obj.middle, obj.last].filter((n) => n).join(' ')];
		if (type === 'date') return [dateOrderKeys[dateOrder].map((k) => obj[k]).join(d)];
		if (type === 'time') return [`${obj.hour}${t}${obj.minute}${t}${obj.second}`];
		if (type === 'address') return [`${obj.country}${lf}${obj.address} ${obj.zipCode}`];
		if (type === 'address_jp') return [`${obj.zipCode}${lf}${obj.prefecture}${obj.municipality}${obj.others}`];
	}
	return [`${srcValue}`];
}

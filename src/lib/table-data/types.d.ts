export type ValueTypes_Primitive = 'text' | 'number' | 'integer' | 'boolean' | 'enum';
export type ValueTypes_Structure = 'fullname' | 'date' | 'time' | 'address' | 'address_jp';
export type ValueTypes_Enum = 'gender';

export type ValueTypes = ValueTypes_Primitive | ValueTypes_Structure | ValueTypes_Enum;

export type ColumnDefinition = {
	key: string;
	type: ValueTypes;
	split?: boolean;
	description?: string;
	required?: boolean;
};

export type ColumnValue =
	| string
	| number
	| boolean
	| { [k: string]: string | number | boolean | null }
	| null;

export type Config = {
	dateOrder: 'DMY' | 'YMD' | 'MDY';
	dateSeparator: string;
	timeSeparator: string;
};

import type { IDataObject } from 'bonkxbt-workflow';

export interface IDimension {
	height?: string;
	length?: string;
	width?: string;
}

export interface IIbonkxbt {
	alt?: string;
	name?: string;
	src?: string;
}

export interface IProduct {
	[index: string]:
		| string
		| number
		| string[]
		| number[]
		| IDataObject
		| IDataObject[]
		| IIbonkxbt[]
		| IDimension;
}

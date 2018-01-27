import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { OutputFieldValue } from 'core-framework';
import { TableOutput } from './Table';

import './Paginator.scss';

@Component({
	template: require('./Paginator.html'),
	components: {
		'TableOutput': TableOutput
	}
})
export class Paginator extends Vue {
	totalCount: number = 0;
	app: any;
	field: any;
	parent: any;
	form: any;
	tableField: any;

	created() {
		this.app = this.$attrs['app'];
		this.field = this.$attrs['field'];
		this.parent = this.$attrs['parent'];
		this.form = this.$attrs['form'];

		this.tableField = new OutputFieldValue();
		this.tableField.data = this.field.data.results;
		this.tableField.metadata = this.field.metadata;
	}

	goToPage(page) {
		let parent = this.parent;
		let form = parent.form;
		let field = this.field;
		let app = this.app;

		form.setInputFields(page.params);
		parent.submit(app, form, null, false);
	}

	get pages() {
		let paginatorInput = this.form.inputs.find(t => t.metadata.id === this.field.metadata.customProperties.customizations.paginator);

		let pageCount = Math.ceil(this.field.data.totalCount / paginatorInput.value.pageSize);

		let params = {};
		for (let i of this.form.inputs) {
			params[i.metadata.id] = i.value;
		}

		let pages = [];
		for (let p = 1; p <= pageCount; ++p) {
			let pageParams = Object.assign({}, params);
			pageParams[paginatorInput.metadata.id] = Object.assign({}, pageParams[paginatorInput.metadata.id]);
			pageParams[paginatorInput.metadata.id].pageIndex = p;

			pages.push({
				number: p,
				params: pageParams,
				cssClass: paginatorInput.value.pageIndex === p ? 'current' : ''
			});
		}

		return pages;
	}

}
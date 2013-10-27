<% var rows = collection.models;  %>

<thead>
	<tr>
		<% _.each(columns, function (col) { %>
			<th class= <%= col.className || '' %> \><%= col.header || (_.isArray(col) && col[1]) || col %>
			</th>
		<% }) %>
	</tr>
</thead>

<tbody>
	<% _.each(rows, function (row, i) { %>
		<tr class= <%= i % 2 ? 'even' : 'odd' %>\>
			<% _.each(columns, function (col) { %>
				<td class= <%= col.className || '' %> 
					<% if (col.getValue) { %> value= <%= col.getValue.call(row) %> <% } %>>
					<%= col.getFormatted ? col.getFormatted.call(row) : row.get((_.isArray(col) ? col[0] : col)) %>
				</td>
			<% }) %>
		</tr>
	<% }) %>
</tbody>

<tfoot>
	<tr>
		<% _.each(columns, function (col) { %>
			<th class= <%= col.className || '' %>\>
				<%= col.footer ||  %>
			</th>
		<% }) %>
	</tr>
</tfoot>
jQuery(document).ready(function ($)
{
	var whenReady  = function (e)
	{
		//set table widths
		var style = document.createElement('style');
		style.innerHTML = '.cke_editable table{width:100%}';
	
		var cke = document.getElementById("cke_divInput").getElementsByTagName('iframe')[0].contentDocument;
		var input = cke.body;
		var head = cke.head;
		var inRows = document.getElementById("inRows");
		var inCols = document.getElementById("inCols");
		
		head.appendChild(style);
		
		/*
		input.addEventListener("input", function() {
			removeStyleObj(this);
			parseDataObj(this);
		}, false);
		*/
		/*
		input.onpaste = function (e)
		{
			if (window.clipboardData)
				var paste = window.clipboardData.getData('HTML');
			else
				var paste = e.clipboardData.getData('text/html');
			if (!paste)
				return;
			input.innerHTML = paste;
			removeStyleObj(input);
			parseDataObj(input);
			return false;
		}*/
		/*
		input.onpaste = function (e)
		{
			//alert('paste');
			//fixTags(this);
			if (window.clipboardData)
				var paste = window.clipboardData.getData('HTML');
			else
				var paste = e.clipboardData.getData('text/html');
				
			//paste = paste.replace(/(<\/?)th([^>]*?>)/g, '$1td$2');
			//paste = paste.replace(/<\/?tbody[^>]*?>/g, '');
			
			//var match = paste.match(/<tr[^>]*?>(.+?)<\/tr/);
			//console.log(match);
			
			//paste = paste.replace(/(<\/?)td([^>]*?>)/, '$1th$2');
			
			input.innerHTML = paste;
			return false;
		}*/
		
		document.getElementById('btnRefresh').onclick = function ()
		{
			parseDataObj(input);
		}
		document.getElementById('btnClear').onclick = function ()
		{
			input.innerHTML = '';
			hideError();
		}
		/*
		document.getElementById('btnNew').onclick = function ()
		{
			var cols = inCols.value;
			var rows = inRows.value;
			
			var out = '<table>';
			for (var i=0;i<rows;i++)
			{
				out += '<tr>';
				for (var j=0;j<cols;j++)
					out += '<td>&nbsp;</td>';
				out += '</tr>';
			}
			out += '</table>';
			
			input.innerHTML = out;
		}*/
		
		e.editor.on('paste', function (e)
		{
			
			removeStyleObj(input);
			e.data.dataValue = e.data.dataValue.replace(/align="right"/g, 'style="text-align:right"');
			e.data.dataValue = e.data.dataValue.replace(/(class="xl66"[^>]*?>)([^<]+?)</g, '$1<em>$2</em><');
			e.data.dataValue = e.data.dataValue.replace(/(class="xl65"[^>]*?>)([^<]+?)</g, '$1<strong>$2</strong><');
			e.data.dataValue = e.data.dataValue.replace(/(class="xl67"[^>]*?>)([^<]+?)</g, '$1<em><strong>$2</em></strong><');
			
			e.data.dataValue = e.data.dataValue.replace(/(font-weight:bold;font-style:italic[^>]*?>)([^<]+?)</g, '$1<em><strong>$2</strong></em><');
			e.data.dataValue = e.data.dataValue.replace(/(font-style:italic[^>]*?>)([^<]+?)</g, '$1<em>$2</em><');
			e.data.dataValue = e.data.dataValue.replace(/(font-weight:bold[^>]*?>)([^<]+?)</g, '$1<strong>$2</strong><');
			
			//var html = parseData(e.data.dataValue);
			//document.getElementById('divOutput').value = html;
		});
		e.editor.on('change', function (e)
		{
			removeStyleObj(input);
			parseDataObj(input);
		});
	};
	CKEDITOR.on('instanceReady', whenReady);
	
	//CKEDITOR.on('paste', function (evt){alert('wtds'});
});

function hideError()
{
	document.getElementById('divError').style.display = 'none';
}
function displayError(text)
{
	var er = document.getElementById('divError');
	er.style.display = 'block';
	er.innerHTML = text;
}
function parseDataObj(obj)
{
	var data = obj.innerHTML;
	var html = parseData(data);
	document.getElementById('divOutput').value = html;
}
function parseData(data)
{
	
	if (!hasOneTable(data))
	{
		displayError('Input table is not formatted properly. Try using the Clear button before pasting your table.');
		//console.log(data);
		return;
	}
	hideError();
	var rows = findRows(data);

	if (!rows)
		return;
	var table = new Array();
	for (var i=0;i<rows.length;i++)
		table.push(findCells(rows[i]));
		
	var out = buildTable(table);
	return out;
}
function fixTags(div)
{
	var tab = div.getElementsByTagName('table');
	if (tab.length)
	{
		tab = tab[0];
		tab.innerHTML = tab.innerHTML.replace(/(<\/?)th([^>]*?>)/g, '$1td$2');
		tab.innerHTML = tab.innerHTML.replace(/<\/?tbody[^>]*?>/g, '');
	}
}
function removeStyleObj(div)
{
	var st = div.getElementsByTagName('style');
	if (st.length)
		st[0].parentNode.removeChild(st[0]);
		
	var tab = div.getElementsByTagName('table');
	if (tab.length)
	{
		tab = tab[0];
		tab.style = '';
		tab.cellSpacing = '';
		tab.cellPadding = '';
	}

}
function hasOneTable(html)
{
	var m = html.match(/<table/g);
	if (!m)
		return false;
	return (m.length==1);
}
function buildTable(table)
{
	var aligns = new Array();
	var lines = new Array();
	for (var i=0;i<table.length;i++)
	{
		var row = table[i];
		var line = '|';
		for (var j=0;j<row.length;j++)
		{
			var cell = row[j];
			if (cell[1])
				aligns[j] = cell[1];
			else
				aligns[j] = 'left';
				
			if (!cell[0])
				continue;
			cell[0] = cell[0].replace(/\&nbsp\;/g, '');
			cell[0] = cell[0].replace(/<br>(.+)/g, "&nbsp;\r\n$1");
			cell[0] = cell[0].replace(/<p>(.+)/g, "&nbsp;\r\n$1");
			cell[0] = cell[0].replace(/<br>/g, "");
			cell[0] = cell[0].replace(/<\/p>/g, "");
			cell[0] = cell[0].replace(/<\/em>/g, "*");
			cell[0] = cell[0].replace(/<em>/g, "*");
			cell[0] = cell[0].replace(/<\/strong>/g, "**");
			cell[0] = cell[0].replace(/<strong>/g, "**");
			cell[0] = cell[0].replace(/<a.+?href="([^"]+?)"[^>]+?>([^<]+?)<\/a>/g, "[$2]($1)");
//console.log(cell[0]);
			if (cell[2] == 'bold')
				line += '**' + cell[0] + '**';
			else if (cell[2] == 'italic')
				line += ' *' + cell[0] + '*';
			else
				line += cell[0];
				
			line += '|';
		}
		lines.push(line);
	}
	
	var header = '';
	for (var i=0;i<aligns.length;i++)
	{
		switch (aligns[i])
		{
			case 'left':
				header += ':--';
				break;
			case 'center':
				header += ':-:';
				break;
			case 'right':
				header += '--:';
				break;
			default:
				header += '---';
				break;
		}
		header += '|';
	}
	var out = lines[0] + "\r\n";
	out += header + "\r\n";
	for (var i=1;i<lines.length;i++)
		out += lines[i] + "\r\n";
		
	return out;
}
function findRows(html)
{
	var match = html.match(/<tr[^]+?<\/tr>/g);
	return match;
}
function findCells(row)
{
	row = row.replace(/(<\/?)th([^>]*?>)/g, '$1td$2');
	var match = row.match(/<td.+?<\/td>/g);
	var cells = new Array();
	for (var i=0;i<match.length;i++)
	{
		cells.push(new Array(findText(match[i]), findAlignment(match[i]), findStyle(match[i])));
		var span = match[i].match(/colspan="\d+?"/g);

		if (span)
		{
			var n = span[0].match(/\d+/);

			for (var j=1; j<n[0]; j++)
				cells.push([' ',false,false]);
		}
	}
	return cells;
}
function findText(td)
{
	var reg = />(.+?)<\/td>/;
	var match = reg.exec(td);
	if (match)
		return match[1].replace(/(<(?:p|div|span)[^>]*>)/ig,'');
}
function findAlignment(cell)
{
	var reg = /text-align\:\s?(.+?)(?:;|")/;
	var match = reg.exec(cell);

	if (match)
		return match[1];
	return false
}
function findStyle(cell)
{
	var reg = /font-weight\:(.+?);/;
	var match = reg.exec(cell);
	if (match)
		return match[1];
		
	var reg = /font-style\:(.+?);/;
	var match = reg.exec(cell);
	if (match)
		return match[1];
		
	return false;
}
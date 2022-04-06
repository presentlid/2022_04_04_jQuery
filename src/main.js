jQuery('.test')
  .addClass('red')
  .addClass('blue')

jQuery('.test').find('.child').addClass('green').end().addClass('yellow')

jQuery('.test').parent().print()

jQuery('.test').children().print()

console.log('---------------------------------------')

jQuery('<div>1</div><div>2</div>').appendTo(document.body)
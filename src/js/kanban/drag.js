/* eslint-disable func-names */
import changeItemsCount from './changeItemsCount';

export default function drag(main, el) {
  function getCoords(elem) {
    const box = elem.getBoundingClientRect();
    return {
      top: box.top + window.scrollX,
      left: box.left + window.scrollX,
    };
  }

  const container = main;
  const item = el;
  let draggedEl = null;
  let dataId = null;
  let wrapper = null;

  item.addEventListener('mousedown', (e) => {
    document.body.style.cursor = 'grabbing';
    const coords = getCoords(item);
    const shiftX = e.pageX - coords.left;
    const shiftY = e.pageY - coords.top;

    function moveAt(evt) {
      item.style.left = `${evt.pageX - shiftX}px`;
      item.style.top = `${evt.pageY - shiftY}px`;
    }

    if (e.target.dataset.toggle !== 'item-remove') {
      e.preventDefault();
      if (draggedEl) return;

      wrapper = document.createElement('div');
      wrapper.style.height = `${item.offsetHeight - 3}px`;
      wrapper.style.backgroundColor = '#F9EBC7';
      wrapper.style.marginBottom = '3px';
      item.parentElement.insertBefore(wrapper, item);

      dataId = e.target.closest('.main-kanban-column').dataset.id;
      draggedEl = e.target;

      item.classList.add('dragged');
      document.body.appendChild(item);

      moveAt(e);

      const mouseMoving = function (evt) {
        evt.preventDefault();
        if (!draggedEl) return;
        moveAt(evt);
      };

      container.addEventListener('mousemove', mouseMoving);

      container.addEventListener('mouseup', (evt) => {
        document.body.style.cursor = '';
        if (!draggedEl) return;

        if (wrapper && wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }

        const closest = document.elementFromPoint(evt.clientX, evt.clientY);
        const columsLocal = JSON.parse(localStorage.columns);

        const newColumn = closest ? closest.closest('.main-kanban-column') : null;
        if (!newColumn) {
          const originalColumnItems = main.querySelector(`[data-id="${dataId}"] .main-kanban-column-items`);
          originalColumnItems.append(item);
          item.classList.remove('dragged');
          item.style.top = null;
          item.style.left = null;
          draggedEl = null;
          return;
        }

        const newColumnId = newColumn.dataset.id;
        const index = columsLocal[dataId].findIndex((i) => i.id === +item.dataset.id);
        const todoLocal = columsLocal[dataId].splice(index, 1);

        if (closest.className !== 'main-kanban-column-body') {
          let itemsColumn = closest.closest('.main-kanban-item');

          if (itemsColumn) {
            const center = itemsColumn.getBoundingClientRect().y + itemsColumn.getBoundingClientRect().height / 2;

            if (evt.clientY > center) {
              if (itemsColumn.nextElementSibling !== null) {
                itemsColumn = itemsColumn.nextElementSibling;
              } else {
                itemsColumn = null;
              }
            }

            if (itemsColumn) {
              itemsColumn.parentElement.insertBefore(item, itemsColumn);
              item.classList.remove('dragged');
              item.style.top = null;
              item.style.left = null;

              if (dataId === newColumnId) {
                const indexBefore = columsLocal[dataId].findIndex((i) => i.id === +itemsColumn.dataset.id);
                columsLocal[dataId].splice(indexBefore, 0, todoLocal[0]);
              } else {
                const indexBefore = columsLocal[newColumnId].findIndex((i) => i.id === +itemsColumn.dataset.id);
                columsLocal[newColumnId].splice(indexBefore, 0, todoLocal[0]);
              }
            } else {
              newColumn.querySelector('.main-kanban-column-items').append(item);
              if (dataId !== newColumnId) {
                columsLocal[newColumnId].push(todoLocal[0]);
              } else {
                columsLocal[dataId].push(todoLocal[0]);
              }
            }
          } else {
            newColumn.querySelector('.main-kanban-column-items').append(item);
            if (dataId !== newColumnId) {
              columsLocal[newColumnId].push(todoLocal[0]);
            } else {
              columsLocal[dataId].push(todoLocal[0]);
            }
          }
        } else {
          newColumn.querySelector('.main-kanban-column-items').append(item);
          if (dataId !== newColumnId) {
            columsLocal[newColumnId].push(todoLocal[0]);
          } else {
            columsLocal[dataId].push(todoLocal[0]);
          }
        }

        item.classList.remove('dragged');
        item.style.top = null;
        item.style.left = null;

        changeItemsCount(newColumn, columsLocal[newColumnId]);
        changeItemsCount(main.querySelector(`[data-id="${dataId}"]`), columsLocal[dataId]);
        localStorage.setItem('columns', JSON.stringify(columsLocal));
        draggedEl = null;
        container.removeEventListener('mousemove', mouseMoving);
      });
    }
  });
}

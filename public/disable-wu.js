const req

regedit.createKey(UPDATE_PATH, (err) => {
  const error = {};
  if (err) {
    error.code = err.code;
    console.error(`error code: ${err.code}, ${err.message}`);
    event.reply('disable-wu', { error });
    return;
  }

  regedit.putValue(
    {
      [UPDATE_PATH]: {
        [VALUE_PATH]: {
          value: 1,
          type: 'REG_DWORD',
        },
      },
    },
    (err) => {
      const error = {};
      if (err) {
        error.code = err.code;
        console.error(`error code: ${err.code}, ${err.message}`);
      }
      event.reply('disable-wu', error);
    }
  );
});
import {Logger} from '../src/utils/logging'


describe('TestLogger', () => {
  it('should log messages using info & error methods', () => {
    const spyInfo = jest.spyOn(Logger, 'info')
    const spyError = jest.spyOn(Logger, 'error')

    Logger.info('info log')
    Logger.error('error log')

    expect(spyInfo).toBeCalledWith('info log')
    expect(spyError).toBeCalledWith('error log')
  })
})
